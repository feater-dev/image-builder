import * as commandLineArgs from 'command-line-args';

interface Config {
    cloneUrl: string
    images: Array<{
        version: string;
        branch?: string;
        tag?: string;
        dockerVersions: string[];
    }>;
}

export interface Options {
    config: string;
    push: boolean;
}

export class OptionsProvider {

    provide(): Options {
        const options = commandLineArgs([
            { name: 'push', type: Boolean, defaultValue: false },
            { name: 'config', type: String, defaultOption: true },
        ]);

        if (!this.areOptionsValid(options)) {
            throw new Error(`Invalid options.`);
        }

        return options;
    }

    private areOptionsValid(options: unknown): options is Options {
        return (
            'string' === typeof (options as Options).config
            && '' !== (options as Options).config.trim()
            && 'boolean' === typeof (options as Options).push
        );
    }

}
