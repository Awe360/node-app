pipeline {
    agent any

    environment {
        DOCKER_IMAGE    = 'awoke/node-crud-app' 
        DOCKER_TAG      = "${BUILD_NUMBER}"
        REGISTRY_URL    = 'https://index.docker.io/v1/'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-credentials',
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_PASS'
                )]) {
                    bat 'echo %DOCKERHUB_USER% | docker login %REGISTRY_URL% -u %DOCKERHUB_USER% --password-stdin'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                bat "docker build -t %DOCKER_IMAGE%:%DOCKER_TAG% ."
                bat "docker tag %DOCKER_IMAGE%:%DOCKER_TAG% %DOCKER_IMAGE%:latest"
            }
        }

        stage('Push Docker Image') {
            steps {
                bat "docker push %DOCKER_IMAGE%:%DOCKER_TAG%"
                bat "docker push %DOCKER_IMAGE%:latest"
            }
        }
    }

    post {
        always {
            bat 'docker logout %REGISTRY_URL% || exit 0'
        }
        success {
            echo "Image successfully pushed: ${DOCKER_IMAGE}:${DOCKER_TAG} and :latest"
        }
        failure {
            echo "Pipeline failed - check console for details"
        }
    }
}