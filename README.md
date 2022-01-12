# esbuild-plugin-prettier

Allow [`prettier`] to be easily called when `watch`ing files in [`esbuild`].

## Why?

I think this might be in conflict with `esbuild`'s goals, but watch mode not running `prettier` for me was a little
annoying, so I thought I'd explore how to write plugins in `esbuild` whilst solving a little annoyance I had.

[`prettier`]: https://prettier.io/
[`esbuild`]: https://esbuild.github.io/