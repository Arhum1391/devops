pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        APP_PATH = '/home/ubuntu/devops'
        APP_COMMITTER_EMAIL = ''
        APP_REPO_URL = 'https://github.com/Arhum1391/devops.git'
        TEST_REPO_URL = 'https://github.com/Arhum1391/selenium-testcases.git'
    }

    stages {
        stage('Checkout App Repo (Trigger Alignment)') {
            steps {
                // Keep Jenkins job associated with appS repo so app pushes trigger this pipeline.
                git branch: 'main', url: "${env.APP_REPO_URL}"
            }
        }

        stage('Checkout Test Code') {
            steps {
                // Clone tests into a separate folder.
                dir('selenium-tests') {
                    deleteDir()
                    git branch: 'main', url: "${env.TEST_REPO_URL}"
                }
            }
        }

        stage('Deploy Application') {
            steps {
                script {
                    env.APP_COMMITTER_EMAIL = sh(
                        script: "cd ${env.APP_PATH} && git log -1 --pretty=format:'%ae' || true",
                        returnStdout: true
                    ).trim()
                    echo "App committer email: ${env.APP_COMMITTER_EMAIL ?: 'not found'}"
                }

                sh '''
                    set -e
                    cd /home/ubuntu/devops
                    git reset --hard HEAD
                    git clean -fd
                    git pull origin main
                    npm install --no-audit
                    npm run build

                    # NOTE: requires sudoers permission for jenkins -> ubuntu pm2
                    sudo -u ubuntu -H pm2 restart techsol || sudo -u ubuntu -H pm2 start npm --name "techsol" -- start
                '''
            }
        }

        stage('Run Selenium Tests') {
            agent {
                docker {
                    image 'markhobson/maven-chrome:latest'
                    args '-u root'
                    reuseNode true
                }
            }
            steps {
                dir('selenium-tests') {
                    sh 'mvn clean test'
                }
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'selenium-tests/target/surefire-reports/*.xml'

            script {
                if (env.APP_COMMITTER_EMAIL?.trim()) {
                    mail to: "${env.APP_COMMITTER_EMAIL}",
                         subject: "DevOps Assignment 3 Results",
                         body: """
                         The Jenkins pipeline for the assignment has finished.

                         Status: ${currentBuild.currentResult}
                         Build Number: ${env.BUILD_NUMBER}

                         Check results here: ${env.BUILD_URL}
                         """
                } else {
                    echo "Skipping email: no app committer email found."
                }
            }
        }
    }
}