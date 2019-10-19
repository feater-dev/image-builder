import {ImageTagGenerator} from './image-tag-generator';
import * as jsYaml from 'js-yaml';
import * as fs from 'fs';
import {ReferenceType} from "./source-provider";

interface RawConfig {
    images: Array<{
        version: string;
        buildContext: string;
        sources: Array<{
            cloneUrl: string;
            branch?: string;
            tag?: string;
            cloneDirectory: string;
        }>;
        dockerVersions: string[];
    }>;
}

export interface SourceConfig {
    cloneUrl: string;
    referenceType: ReferenceType,
    referenceName: string,
    cloneDirectory: string,
}

export interface ImageConfig {
    imageTag: string;
    version: string;
    buildContext: string;
    sources: SourceConfig[];
    dockerVersion: string;
}

export interface Config {
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
            images: [],
        };

        for (const rawImageConfig of rawConfig.images) {
            const mappedSourceConfigs: SourceConfig[] = [];
            for (const rawSourceConfig of rawImageConfig.sources) {
                let referenceType: ReferenceType;
                let referenceName: string;
                if (rawSourceConfig.branch && rawSourceConfig.tag) {
                    throw new Error('Both branch and name referenced in source config.');
                } else if (rawSourceConfig.branch) {
                    referenceType = ReferenceType.BRANCH;
                    referenceName = rawSourceConfig.branch;
                } else if (rawSourceConfig.tag) {
                    referenceType = ReferenceType.TAG;
                    referenceName = rawSourceConfig.tag;
                } else {
                    throw new Error('Neither branch nor name referenced in source config.');
                }
                mappedSourceConfigs.push({
                    cloneUrl: rawSourceConfig.cloneUrl,
                    referenceType,
                    referenceName,
                    cloneDirectory: rawSourceConfig.cloneDirectory,
                });
            }
            for (const dockerVersion of rawImageConfig.dockerVersions) {
                mappedConfig.images.push({
                    imageTag: this.imageTagGenerator.generate(rawImageConfig.version, dockerVersion),
                    buildContext: rawImageConfig.buildContext,
                    version: rawImageConfig.version,
                    sources: mappedSourceConfigs,
                    dockerVersion,
                });
            }
        }

        return mappedConfig;
    }

    private isRawConfigValid(config: unknown): config is RawConfig {
        if (!((config as RawConfig).images instanceof Array)
        ) {
            return false;
        }

        for (const imageConfig of (config as RawConfig).images) {
            if (
                'string' !== typeof imageConfig.version
                || 'string' !== typeof imageConfig.buildContext
                || !((imageConfig.sources) instanceof Array)
                || !((imageConfig.dockerVersions) instanceof Array)
            ) {
                return false;
            }
            for (const sourceConfig of imageConfig.sources) {
                if (
                    'string' !== typeof sourceConfig.cloneUrl
                    || ('string' !== typeof sourceConfig.branch && 'undefined' !== typeof sourceConfig.branch)
                    || ('string' !== typeof sourceConfig.tag && 'undefined' !== typeof sourceConfig.tag)
                    || 'string' !== typeof sourceConfig.cloneDirectory
                ) {
                    return false;
                }
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
