pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials-id')
    }
  
    stages {
        stage('Cleanup Workspace') {
            steps {
                // Clean up the workspace to ensure no conflicts with previous builds
                script {
                    sh '''
                        if [ -d "Back-End" ]; then
                            rm -rf Back-End
                        fi
                    '''
                }
            }
        }
        
        stage('Checkout Backend') {
            steps {
                // Clone the backend repository
                withCredentials([usernamePassword(credentialsId: 'github-auth', passwordVariable: 'GITHUB_TOKEN', usernameVariable: 'GITHUB_USERNAME')]) {
                    sh 'git clone https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/Motaql-Social-media/Back-End.git Back-End'
                }
            }
        }
        
        stage('Build Backend Image') {
            steps {
                script {
                    dir('Back-End') {
                        // Login to Docker Hub
                        sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                        
                        // Build the Docker image
                        sh 'docker build -t backend-image .'
                        
                        // Tag the Docker image
                        sh "docker tag backend-image:latest ${DOCKERHUB_CREDENTIALS_USR}/backend-image:latest"
                        
                        // Push the Docker image to Docker Hub
                        echo 'Pushing image to Docker Hub...'
                        sh 'docker push ${DOCKERHUB_CREDENTIALS_USR}/backend-image:latest'
                        
                        // Logout from Docker Hub
                        sh 'docker logout'
                    }
                }
            }
        }
        /*
           stage('Deploy to Kubernetes') {
            steps {
                script {
                    withEnv(["KUBECONFIG=/var/lib/jenkins/.kube/config-rancher-cluster"]) {
                        dir('Back-End') {
                           sh 'kubectl delete deployment backend-deployment || true'
                            sh 'kubectl apply -f backend-depl.yaml --validate=false'
                        }
                    }
                }
            }
        }
        */
        stage('Deploy with Docker Compose') {
            steps {
                script {
                    dir('Back-End') {
                        // Ensure Docker Compose is up-to-date
                        sh 'docker-compose -f docker-compose.yaml pull'

                        // Stop and remove existing containers
                        sh 'docker-compose -f docker-compose.yaml down'
                        
                        // Start containers defined in the docker-compose file
                        sh 'docker-compose -f docker-compose.yaml up -d'
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up...'
            script {
                echo 'Cleaning up Docker system...'
                // Remove all stopped containers
                sh 'docker container prune -f'
                // Remove all dangling images
                sh 'docker image prune -f'
                // Remove all unused volumes
                sh 'docker volume prune -f'
                // Remove all unused networks
                sh 'docker network prune -f'
                // Remove all unused Docker objects (containers, images, volumes, networks)
                sh 'docker system prune -a -f'
            }
        }
        
        success {
            echo 'Pipeline completed successfully!'
        }
        
        failure {
            echo 'Pipeline failed.'
        }
    }
}
