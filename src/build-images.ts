import { OptionsProvider } from './options-provider';
import { ConfigProvider } from './config-provider';
import { ImageTagGenerator } from './image-tag-generator';
import { ImageBuilder } from './image-builder';
import { ImagePusher } from './image-pusher';
import { SourceProvider } from './source-provider';

// TODO Store build logs in files, output only when failed.
// TODO Move main command to some class.
// TODO Copy build context and source to some working diretory.

const optionsProvider = new OptionsProvider();
const options = optionsProvider.provide();

const imageTagGenerator = new ImageTagGenerator();

const configProvider = new ConfigProvider(imageTagGenerator);
const config = configProvider.provide(options.config);

console.info(`\n\n--- Found ${config.images.length} image tags to build.\n\n`);
for (const imageConfig of config.images) {
	console.info(imageConfig.imageTag);
}

console.info(`\n\n--- Building images...`);
const sourceProvider = new SourceProvider();
const imageBuilder = new ImageBuilder(sourceProvider);
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

console.info(`\n\n`);
