import { getMetadataStorage } from '../';
import { FlagMetadataArgs } from './args';
import { CommandMetadata } from './CommandMetadata';
import { FlagMetadata } from './FlagMetadata';
import { MetadataStorage } from './MetadataStorage';
import { AuthMetadata } from './AuthMetadata';

export class MetadataBuilder {
  private readonly metadataStorage: MetadataStorage;

  constructor() {
    this.metadataStorage = getMetadataStorage();
  }

  buildCommandMetadata(classes?: Function[]): CommandMetadata[] {
    return this.createCommands(classes);
  }

  private createCommands(classes?: Function[]): CommandMetadata[] {
    const commands = classes ? this.metadataStorage.filterMetadataForCommands(classes) : this.metadataStorage.commands;
    return commands.map(args => {
      const command = new CommandMetadata(args);
      command.flags = this.createFlags(command);
      command.auth = this.createCommandAuth(command);
      return command;
    });
  }

  private createFlags(command: CommandMetadata): FlagMetadata[] {
    let target = command.target;
    const flagsWithTarget: FlagMetadataArgs[] = [];
    while (target) {
      flagsWithTarget.push(
        ...this.metadataStorage
          .filterFlagsForTarget(target)
          .filter(flag => flagsWithTarget.map(f => f.method).indexOf(flag.method) === -1)
      );
      target = Object.getPrototypeOf(target);
    }
    return flagsWithTarget.map(args => {
      const flag = new FlagMetadata(args);
      flag.auth = this.createFlagAuth(command, flag.name);
      return flag;
     });
  }

  private createCommandAuth(command: CommandMetadata) {
    const target = command.target;
    const auth = this.metadataStorage.filterAuthForCommand(target);
    return new AuthMetadata(auth);
  }

  private createFlagAuth(command: CommandMetadata, method: string) {
    const target = command.target;
    const auth = this.metadataStorage.filterAuthForFlag(target, method);
    return new AuthMetadata(auth);
  }
}
