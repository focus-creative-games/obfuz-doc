# Garbage Code Generation

Garbage code generation can reduce binary code similarity between apps and other apps, used to counter app store similarity reviews.

## Garbage Code Strategies

Currently there are the following garbage code strategies:

- Independently generate a large amount of message, configuration, and UI-related garbage code
- Inject a large amount of garbage instructions into normal code

## Settings

`ObfuzSettings.GarbageCodeGenerationSettings` contains garbage code related settings, detailed documentation can be found in [Configuration](./configuration).

## Garbage Code Categories

Currently supports generation of the following categories of garbage code:

- Config: Generate configuration loading code in [Luban](https://github.com/focus-creative-games/luban) style.
- UI: Generate UGUI-based UI binding code.

Garbage code categories that may be supported in the future:

- Protocol code
- Controller code

## Garbage Code Obfuscation

Obfuscating garbage code can be achieved by generating garbage code into the obfuscation program. Obfuscated garbage code can further improve code complexity and reduce code similarity.
