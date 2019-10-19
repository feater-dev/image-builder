import * as childProcess from 'child_process';
import * as rimraf from "rimraf";

export enum ReferenceType {
    BRANCH = 'branch',
    TAG = 'tag',
}

export class SourceProvider {

    provide(cloneUrl: string, referenceType: ReferenceType, referenceName: string, cloneDirectory: string): void {
        const reference = ReferenceType.BRANCH === referenceType
            ? referenceName
            : `tags/${referenceName}`;
        const commands = [
            `git clone ${cloneUrl} ${cloneDirectory}`,
            `(cd ${cloneDirectory} && git reset --hard)`,
            `(cd ${cloneDirectory} && git checkout ${reference})`,
        ];

        childProcess.execSync(commands.join(' && '), {stdio: 'inherit'});
    }

    remove(cloneDirectory: string): void {
        rimraf.sync(cloneDirectory);
    }

}
