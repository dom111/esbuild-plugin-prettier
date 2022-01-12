import { Loader, OnLoadArgs, OnLoadResult, Plugin, PluginBuild } from 'esbuild';
import { Options, check, format, getFileInfo, resolveConfig } from 'prettier';
import { promises } from 'fs';

const NAMESPACE = 'esbuild-plugin-prettier';

export type PrettierOptions = Options & {
  filter?: RegExp;
  write?: boolean;
  loader?: (path: string) => Loader;
};

const prettierOptions: PrettierOptions = {
  // Whether or not to write the changes to the filesystem.
  write: true,
  // The filter for files to format with prettier.
  filter: /\.([tj]sx?|s?css)$/,
  // Returns the loader for esbuild to use.
  loader: (path: string): Loader => path.split(/\./).pop() as Loader,
};

export class Prettier implements Plugin {
  public name: string = NAMESPACE;

  constructor(options: PrettierOptions = {}) {
    Object.assign(prettierOptions, options);
  }

  setup({ onLoad }: PluginBuild): void {
    const { write, filter, loader, ...otherOptions } = prettierOptions;

    onLoad(
      {
        filter,
      },
      async ({ path }: OnLoadArgs): Promise<OnLoadResult> => {
        const { ignored, inferredParser: parser } = await getFileInfo(path, {
            resolveConfig: true,
          }),
          options = Object.assign(
            {
              parser,
            },
            await resolveConfig(path),
            otherOptions
          ),
          warnings = [];

        let contents = await promises.readFile(path, 'utf8');

        if (!ignored && !check(contents, options)) {
          if (write) {
            contents = format(contents, options);
            promises.writeFile(path, contents);
          } else {
            warnings.push({
              pluginName: NAMESPACE,
              text: `'${path}' requires formatting.`,
            });
          }
        }

        return {
          pluginName: NAMESPACE,
          warnings,
          contents,
          loader: loader(path),
        };
      }
    );
  }
}

export default Prettier;
