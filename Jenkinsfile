pipeline {
    agent any

    environment {
        DOCKER_IMAGE    = 'awoke/node-crud-app'
        DOCKER_TAG      = "${BUILD_NUMBER}"
        REGISTRY_URL    = 'https://index.docker.io/v1/'

        // Use your normal user profile kubeconfig (most reliable for local minikube)
        KUBECONFIG      = "${env.USERPROFILE}\\.kube\\config"

        // Standard Minikube install path on Windows
        MINIKUBE_EXE    = "C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe"
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
                    bat 'echo Logging in to Docker Hub'
                    bat 'echo %DOCKERHUB_PASS% | docker login %REGISTRY_URL% -u %DOCKERHUB_USER% --password-stdin'
                }
            }
        }

        stage('Build & Tag Docker Image') {
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

        stage('Deploy to Minikube') {
            steps {
                script {
                    echo "Using KUBECONFIG = ${env.KUBECONFIG}"

                    // Debug: show current dir and list files
                    bat 'cd'
                    bat 'dir'
                    bat 'dir k8s'

                    // Check manifests exist
                    bat 'if not exist k8s\\deployment.yaml (echo ERROR: k8s/deployment.yaml missing & exit /b 1)'
                    bat 'if not exist k8s\\service.yaml   (echo ERROR: k8s/service.yaml missing   & exit /b 1)'

                    // Render deployment with current build tag
                    def rendered = "${WORKSPACE}\\k8s\\deployment.rendered.yaml"
                    bat """
                        powershell -NoProfile -Command "(Get-Content k8s/deployment.yaml) -replace '__TAG__', '%DOCKER_TAG%' | Set-Content -Encoding ascii '${rendered}'"
                    """
                    bat "type \"${rendered}\""

                    withEnv(["KUBECONFIG=${KUBECONFIG}"]) {
                        // Start minikube if not already running
                        bat """
                            "${MINIKUBE_EXE}" status >nul 2>&1 || (
                                echo "Minikube not running - starting..."
                                "${MINIKUBE_EXE}" start --driver=docker
                            )
                        """

                        // Quick cluster checks
                        bat "\"${MINIKUBE_EXE}\" kubectl -- config current-context"
                        bat "\"${MINIKUBE_EXE}\" kubectl -- get nodes"

                        // Apply manifests
                        bat "\"${MINIKUBE_EXE}\" kubectl -- apply -f \"${rendered}\""
                        bat "\"${MINIKUBE_EXE}\" kubectl -- apply -f k8s/service.yaml"

                        // Show deployment status
                        bat "\"${MINIKUBE_EXE}\" kubectl -- get pods -o wide"
                        bat "\"${MINIKUBE_EXE}\" kubectl -- get svc"
                    }
                }
            }
        }
    }

    post {
        always {
            bat 'docker logout %REGISTRY_URL% || exit 0'
        }
        success {
            echo "Pipeline SUCCESS! App deployed to Minikube."
            echo "Get the URL: minikube service node-crud-service --url   (or check service name in your service.yaml)"
        }
        failure {
            echo "Pipeline FAILED - check console output for clues"
        }
    }
}