pipeline {
    agent any

    stages {   
        stage('Git Clone') {
            steps {  
                script { 
                    try{
                        git url: "https://github.com/twoDeveloperrr/source-nodejs.git", branch: "master" 
                        env.cloneResult=true
                    }catch(error){
                        print(error)
                        env.cloneResult=false
                         currentBuild.result='FAILURE'
                    }
                }
                    
          }
        }
        stage('Docker Build'){
            when{
                expression {
                    return env.cloneResult ==~ /(?i)(Y|YES|T|TRUE|ON|RUN)/
                }
            }
            steps {
                script{
                    try{
                    
                        sh"""
                        cp docker/Dockerfile ./
			cp -r webapp/** ./
                        docker build -t ${env.JOB_NAME.toLowerCase()} .
			docker tag ${env.JOB_NAME.toLowerCase()}:latest 924926213084.dkr.ecr.ap-northeast-2.amazonaws.com/twodeveloper:${env.BUILD_NUMBER}
                        """
                         env.dockerBuildResult=true
                    }catch(error){
                        print(error)
                         env.dockerBuildResult=false
                         currentBuild.result='FAILURE'
                    }
                }
            }
        }
	stage('Build Image Push'){
            when{
                expression {
                    return env.dockerBuildResult ==~ /(?i)(Y|YES|T|TRUE|ON|RUN)/
                }
            }
            steps {
                script{
                    try{
                    
                        sh"""
                        aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 924926213084.dkr.ecr.ap-northeast-2.amazonaws.com
                        docker push 924926213084.dkr.ecr.ap-northeast-2.amazonaws.com/twodeveloper:${env.BUILD_NUMBER}
                        docker rmi 924926213084.dkr.ecr.ap-northeast-2.amazonaws.com/twodeveloper:${env.BUILD_NUMBER}
                        """
                         env.dockerBuildResult2=true
                    }catch(error){
                        print(error)
                         env.dockerBuildResult2=false
                         currentBuild.result='FAILURE'
                    }
                }
            }
        }
	stage('K8S Manifest Update') {
            when{
                expression {
                return env.dockerBuildResult ==~ /(?i)(Y|YES|T|TRUE|ON|RUN)/
                }
            }
            steps {
                script {
                    try{
                        git url: "https://github.com/twoDeveloperrr/source-nodejs.git",
                            branch: "master"
                        sh"""
                        git branch -M master
                        sed -i 's/twodeveloper:.*\$/twodeveloper:${env.BUILD_NUMBER}/g' manifest/kube.yaml
                        git add manifest/kube.yaml
                        git commit -m '[UPDATE] twodeveloper  image versioning'
                        git remote set-url origin git@github.com:twoDeveloperrr/source-nodejs.git
                        git push -u origin master
                        """
                        env.tagUpdateResult=true
                    }catch(error){
                        print(error)
                        env.tagUpdateResult=false
                         tagUpdateResult.result='FAILURE'
                    }
                }
                
            }
    }
  }
}
