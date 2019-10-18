import { ImageTagGenerator } from './image-tag-generator';
import * as jsYaml from 'js-yaml';
import * as fs from 'fs';

interface RawConfig {
    cloneUrl: string
    images: Array<{
        version: string;
        sourceBranch?: string;
        sourceTag?: string;
        dockerVersions: string[];
    }>;
}

export interface ImageConfig {
    imageTag: string;
    version: string;
    sourceBranch?: string;
    sourceTag?: string;
    dockerVersion: string;
}

export interface Config {
    cloneUrl: string,
    images: ImageConfig[];
}

export class ConfigProvider {

    constructor(
        private readonly imageTagGenerator: ImageTagGenerator,
    ) {}

    provide(configOption: string): Config {
        const rawConfig: unknown = jsYaml.safeLoad(fs.readFileSync(configOption, 'utf8'));

        if (!this.isRawConfigValid(rawConfig)) {
            throw new Error('Invalid config.');
        }

        const mappedConfig: Config = {
            cloneUrl: rawConfig.cloneUrl,
            images: [],
        };

        for (const rawImageConfig of rawConfig.images) {
            for (const dockerVersion of rawImageConfig.dockerVersions) {
                mappedConfig.images.push({
                    imageTag: this.imageTagGenerator.generate(rawImageConfig.version, dockerVersion),
                    version: rawImageConfig.version,
                    sourceBranch: rawImageConfig.sourceBranch,
                    sourceTag: rawImageConfig.sourceTag,
                    dockerVersion,
                });
            }
        }

        return mappedConfig;
    }

    private isRawConfigValid(config: unknown): config is RawConfig {
        if (
            'string' !== typeof (config as RawConfig).cloneUrl
            || !((config as RawConfig).images instanceof Array)
        ) {
            return false;
        }

        for (const imageConfig of (config as RawConfig).images) {
            if (
                'string' !== typeof imageConfig.version
                || ('undefined' !== typeof imageConfig.sourceTag && 'string' !== typeof imageConfig.sourceTag)
                || ('undefined' !== typeof imageConfig.sourceBranch && 'string' !== typeof imageConfig.sourceBranch)
                || !((imageConfig.dockerVersions) instanceof Array)
            ) {
                return false;
            }
            for (const dockerVersion of imageConfig.dockerVersions) {
                if ('string' !== typeof dockerVersion) {
                    return false;
                }
            }
        }

        return true;
    }

}
