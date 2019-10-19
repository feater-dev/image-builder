import { ImageConfig } from './config-provider';
import * as childProcess from 'child_process';

export class ImagePusher {

    push(imageConfig: ImageConfig): void {
        const {imageTag} = imageConfig;

        console.info(`\n\n--- Pushing image ${imageTag}...\n\n`);
        childProcess.execSync(`docker push ${imageConfig.imageTag}`, {stdio: 'inherit'});
    }

}
