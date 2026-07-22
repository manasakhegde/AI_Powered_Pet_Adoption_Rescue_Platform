pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = 'pet-adoption-backend'
        FRONTEND_IMAGE = 'pet-adoption-frontend'
        IMAGE_TAG      = "${BUILD_NUMBER}"
        MAVEN          = 'C:\\Program Files\\JetBrains\\IntelliJ IDEA 2026.1.2\\plugins\\maven\\lib\\maven3\\bin\\mvn.cmd'
        JAVA_HOME      = 'C:\\Program Files\\Java\\jdk-21.0.11'
    }

    stages {

        // ── Stage 1: Checkout ──────────────────────────────────────
        stage('Checkout') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
            }
        }

        // ── Stage 2: Build Backend ─────────────────────────────────
        stage('Build Backend') {
            steps {
                dir('Backend') {
                    echo '🔨 Building Spring Boot backend (Java 21)...'
                    bat '"C:\\Program Files\\JetBrains\\IntelliJ IDEA 2026.1.2\\plugins\\maven\\lib\\maven3\\bin\\mvn.cmd" clean package -DskipTests -q'
                }
            }
            post {
                success { echo '✅ Backend build successful' }
                failure { echo '❌ Backend build failed' }
            }
        }

        // ── Stage 3: Build Frontend ────────────────────────────────
        stage('Build Frontend') {
            steps {
                dir('Frontend') {
                    echo '⚛️  Building React frontend...'
                    bat 'npm ci --silent'
                    bat 'npm run build'
                }
            }
            post {
                success { echo '✅ Frontend build successful' }
                failure { echo '❌ Frontend build failed' }
            }
        }

        // ── Stage 4: Run Backend Tests ─────────────────────────────
        stage('Test Backend') {
            steps {
                dir('Backend') {
                    echo '🧪 Running backend unit tests...'
                    bat '"C:\\Program Files\\JetBrains\\IntelliJ IDEA 2026.1.2\\plugins\\maven\\lib\\maven3\\bin\\mvn.cmd" test'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'Backend/target/surefire-reports/*.xml'
                }
            }
        }

        // ── Stage 5: Run Frontend Tests ────────────────────────────
        stage('Test Frontend') {
            steps {
                dir('Frontend') {
                    echo '🧪 Running frontend tests...'
                    bat 'npm test -- --watchAll=false --passWithNoTests'
                }
            }
        }

        // ── Stage 6: Code Quality (SonarQube) ─────────────────────
        stage('Code Quality') {
            when { expression { return env.SONAR_TOKEN != null } }
            steps {
                dir('Backend') {
                    echo '🔍 Running SonarQube analysis...'
                    bat '"C:\\Program Files\\JetBrains\\IntelliJ IDEA 2026.1.2\\plugins\\maven\\lib\\maven3\\bin\\mvn.cmd" sonar:sonar -Dsonar.projectKey=pet-adoption-platform -Dsonar.host.url=http://localhost:9000 -Dsonar.login=%SONAR_TOKEN%'
                }
            }
        }

        // ── Stage 7: Docker Build ──────────────────────────────────
        stage('Docker Build') {
            steps {
                echo '🐳 Building Docker images...'
                bat 'docker build -t %BACKEND_IMAGE%:%IMAGE_TAG% ./Backend'
                bat 'docker build -t %FRONTEND_IMAGE%:%IMAGE_TAG% ./Frontend'
                bat 'docker tag %BACKEND_IMAGE%:%IMAGE_TAG% %BACKEND_IMAGE%:latest'
                bat 'docker tag %FRONTEND_IMAGE%:%IMAGE_TAG% %FRONTEND_IMAGE%:latest'
            }
        }

        // ── Stage 8: Docker Compose Deploy ────────────────────────
        stage('Deploy (docker-compose)') {
            when { branch 'main' }
            steps {
                echo '🚀 Deploying with docker-compose...'
                bat 'docker-compose down --remove-orphans'
                bat 'docker-compose up -d --build'
                bat 'ping -n 30 127.0.0.1 > nul'
            }
        }

        // ── Stage 9: Smoke Tests ───────────────────────────────────
        stage('Smoke Tests') {
            when { branch 'main' }
            steps {
                echo '💨 Running smoke tests...'
                bat 'curl -f http://localhost:8081/actuator/health'
                bat 'curl -f http://localhost:3000'
            }
        }

    }

    post {
        always {
            echo '🧹 Cleaning workspace...'
            cleanWs()
        }
        success {
            echo '🎉 Pipeline PASSED — Pet Adoption Platform deployed!'
        }
        failure {
            echo '🚨 Pipeline FAILED — check logs above'
        }
    }
}
