import { ImageConfig } from './config-provider';
import * as childProcess from 'child_process';
import {SourceProvider} from "./source-provider";
import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';

export class ImageBuilder {

    constructor(
        private readonly sourceProvider: SourceProvider,
    ) {}

    build(imageConfig: ImageConfig): void {
        for (const sourceConfig of imageConfig.sources) {
            const { cloneUrl, referenceType, referenceName } = sourceConfig;

            console.info(`\n\n--- Cloning repository ${cloneUrl} and checking out ${referenceType} named ${referenceName}...\n\n`);

            const fullCloneDirectory = path.join(imageConfig.buildContext, sourceConfig.cloneDirectory);

            rimraf.sync(fullCloneDirectory);
            fs.mkdirSync(fullCloneDirectory);

            this.sourceProvider.provide(cloneUrl, referenceType, referenceName, fullCloneDirectory);
        }

        const {imageTag, buildContext, dockerVersion} = imageConfig;

        console.info(`\n\n--- Building image ${imageTag} in ${buildContext}...\n\n`);

        childProcess.execSync(
            `(cd ${buildContext} && docker build --pull --build-arg DOCKER_VERSION=${dockerVersion} -f ./Dockerfile -t ${imageTag} .)`,
            {stdio: 'inherit'},
        );

        for (const sourceConfig of imageConfig.sources) {
            const fullCloneDirectory = path.join(imageConfig.buildContext, sourceConfig.cloneDirectory);

            this.sourceProvider.remove(fullCloneDirectory);
        }
    }

}
