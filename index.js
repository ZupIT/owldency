const { exec } = require('child_process');
const artifact = require('@actions/artifact');

try {

    exec("find . -name 'pom.xml'", (error, stdout, stderr) => {
        
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }

        if (`${stdout}`.length != 0) {

            console.log("> Found pom.xml!");
            console.log("> Analysing your Maven project...");

            exec("mvn dependency-check:check" , (error, stdout, stderr) => {
            
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }

                exec("cat target/dependency-check-report.json" , (error, stdout, stderr) => { console.log(`${stdout}`) } );
            
                console.log("> Generating your report...");

                const artifactClient = artifact.create();
                const report = 'dependency-report';
                const rootDirectory = './'
                const file = ['target/dependency-check-report.html'];
                const options = {
                    continueOnError: true
                }
                artifactClient.uploadArtifact(report, file, rootDirectory, options);
            })

        }

    });

    exec("find . -name 'build.gradle'", (error, stdout, stderr) => {
        
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }

        if (`${stdout}`.length != 0) {

            console.log("> Found gradle.build!");
            console.log("> Analysing your Gradle project...")

            exec("sudo chmod +x gradlew && ./gradlew dependencyCheckAnalyze" , (error, stdout, stderr) => {
                
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }

                exec("cat build/reports/dependency-check-report.json" , (error, stdout, stderr) => { console.log(`${stdout}`) });

                console.log("> Generating your report...");

                const artifactClient = artifact.create();
                const report = 'dependency-report';
                const rootDirectory = './'
                const file = ['build/reports/dependency-check-report.html'];
                const options = {
                    continueOnError: true
                }
                artifactClient.uploadArtifact(report, file, rootDirectory, options);
            })
        
        }

    });

    exec("find . -name 'package.json' ! -path './node_modules/*'", (error, stdout, stderr) => {

        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }

        if (`${stdout}`.length != 0) {

            console.log("> Found package.json!");
            console.log("> Analysing your NPM project...")

            exec("sudo npm i --package-lock-only && sudo npm i -g npm-audit-html", (error, stdout, stderr) => {
                
                exec("npm audit --json | tee output.json", (error, stdout, stderr) => { 

                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }

                    console.log(`${stdout}`);

                    exec("cat output.json | npm-audit-html --output dependency-report.html", (error, stdout, stderr) => { 

                        if (error) {
                            console.log(`error: ${error.message}`);
                            return;
                        }

                        console.log("> Generating your report...");

                        const artifactClient = artifact.create();
                        const report = 'dependency-report';
                        const rootDirectory = './'
                        const file = ['./dependency-report.html'];
                        const options = {
                            continueOnError: true
                        }
                        artifactClient.uploadArtifact(report, file, rootDirectory, options);
                    })

                })

                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }

            })

        }
    });

} catch (error) {
    core.setFailed(error.message);
}