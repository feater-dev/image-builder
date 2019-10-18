export class ImageTagGenerator {

    generate(version: string, dockerVersion: string): string {
        return `feater/feater:${version}-docker-${dockerVersion}`;
    }

}
