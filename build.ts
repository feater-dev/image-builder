import { OptionsProvider } from './src/options-provider';
import { ConfigProvider } from './src/config-provider';
import { ImageTagGenerator } from './src/image-tag-generator';
import { ImageBuilder } from './src/image-builder';
import { ImagePusher } from './src/image-pusher';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as childProcess from 'child_process';

// TODO Store build logs in files, output only when failed.

const optionsProvider = new OptionsProvider();
const options = optionsProvider.provide();

const imageTagGenerator = new ImageTagGenerator();

const configProvider = new ConfigProvider(imageTagGenerator);
const config = configProvider.provide(options.config);

const cloneDirectory = 'source';

console.info(`\n\n--- Found ${config.images.length} image versions to build.\n\n`);

for (const imageConfig of config.images) {
	console.info(imageConfig.imageTag);
}

console.info(`\n\n--- Preparing source...\n\n`);
rimraf.sync(cloneDirectory);
fs.mkdirSync(cloneDirectory);
childProcess.execSync(`git clone ${config.cloneUrl} ${cloneDirectory}`, {stdio: 'inherit'});

console.info(`\n\n--- Building images...`);
const imageBuilder = new ImageBuilder(cloneDirectory);
for (const imageConfig of config.images) {
	imageBuilder.build(imageConfig);
}

console.info(`\n\n--- Pushing images...`);
const imagePusher = new ImagePusher();
if (options.push) {
	for (const imageConfig of config.images) {
		imagePusher.push(imageConfig);
	}

}

console.info(`\n\n--- Removing source...\n\n`);
rimraf.sync(cloneDirectory);

console.info(`\n\n`);
