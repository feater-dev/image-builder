import { ImageConfig } from './config-provider';
import * as childProcess from 'child_process';

export class ImageBuilder {

    constructor(
        private readonly cloneDirectory: string,
    ) {}

    build(imageConfig: ImageConfig): void {
        const {imageTag, version, sourceBranch, sourceTag, dockerVersion} = imageConfig;

        const gitResetCommand = `cd ${this.cloneDirectory} && git reset --hard`;
        const dockerBuildCommand = `docker build --pull --build-arg DOCKER_VERSION=${dockerVersion} -f ./.docker/prod/Dockerfile -t ${imageTag} .`;
        let gitCheckoutCommand: string;

        if (!sourceBranch && !sourceTag) {
            throw new Error(`Neither branch nor tag defined for image config.`);
        }

        if (sourceBranch && sourceTag) {
            throw new Error(`Both branch and tag defined for image config.`);
        }

        if (sourceBranch) {
            console.info(`\n\n--- Building image ${imageTag} for branch ${sourceBranch} and Docker version ${dockerVersion}...\n\n`);
            gitCheckoutCommand = `git checkout ${sourceBranch}`;
        } else if (sourceTag) {
            console.info(`\n\nBuilding image ${imageTag} for tag ${sourceTag} and Docker version ${dockerVersion}...\n\n`);
            gitCheckoutCommand = `git checkout tags/${sourceTag}`;
        }

        const commands = [gitResetCommand, gitCheckoutCommand, dockerBuildCommand];

        childProcess.execSync(commands.join(' && '), {stdio: 'inherit'});
    }

}
