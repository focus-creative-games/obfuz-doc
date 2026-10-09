# Incremental Obfuscation and Hot Update

Obfuz supports incremental obfuscation, with most Obfuscation Passes striving to maintain obfuscation stability.

- Symbol Obfuscation uses symbol mapping files to ensure obfuscation stability.
- Const Obfuscation uses deterministic random encryption algorithms for each constant.
- Field Encryption uses deterministic random encryption algorithms for each field.
- Call Obfuscation uses deterministic random encryption algorithms for each called function.

## Obfuscation in Build Pipeline

Simply keeping settings stable will automatically maintain obfuscation stability in the build pipeline.

## Standalone Obfuscation Execution

As long as obfuscation settings are not modified, it works the same as obfuscation in the build pipeline and will automatically maintain obfuscation stability. For detailed documentation, see [Run Obfuscation Standalone](./run-obfuscation-standalonely).

## Hot Update

Obfuscation in hot updates follows exactly the same process as standalone obfuscation execution.

If incremental obfuscation stability is not a concern, you can modify the following parameters to make the obfuscation results as different as possible for each hot update:

- Delete hot update code related configuration sections from the symbol mapping file
- Modify the `SecretSettings.DefaultDynamicSecretKey` field
- Modify the `SecretSettings.RandomSeed` field

Modifying `ConstEncrypSettings.EncryptionLevel`, `FieldEncryptSettings.EncryptionLevel`, and `CallObfusSettings.ObfuscationLevel` can also affect obfuscation results.
However, increasing these values will cause encryption performance degradation, so it's recommended not to modify them frequently.
