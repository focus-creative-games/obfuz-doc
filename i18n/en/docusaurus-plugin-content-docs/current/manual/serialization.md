# Serialization

[Symbol Obfuscation](./symbol-obfuscation) modifies the names of various metadata. Unity's built-in serialization mechanisms like MonoBehaviour, ScriptableObject, and JsonUtility heavily depend on metadata name information,
so without special handling, these functions will not work properly after symbol obfuscation.

## Special Support for Unity Built-in Serialization

Obfuz is deeply integrated with Unity workflows and provides special handling for Unity's serialization mechanisms:

- Will not obfuscate type names and namespaces of MonoBehaviour, ScriptableObject, and types marked with `[Serializable]` attribute
- Will not obfuscate serialized fields of the above types, including private fields marked with `[SerializedField]` attribute
- Will not obfuscate non-static public properties of the above types, but public static and non-public properties will still be obfuscated
- Will not obfuscate enum item names of enum types marked with `[Serializable]` attribute
- Will not obfuscate event functions with special purposes like `Awake`, `Start` in MonoBehavior

However, Obfuz does not handle `UnityEvent` fields on scene objects, so if callback functions for `UnityEvent` type fields are set in the `Inspector`, symbol obfuscation for these functions needs to be disabled,
otherwise runtime errors of not finding callback functions will occur.

## Special Support for Third-party Serialization Libraries like Newtonsoft.Json

Adding the `[Serializable]` attribute to types that need serialization has the following effects:

- Type names, namespaces, public non-static fields, and public non-static member properties will not be obfuscated.
- Enum item names of enum types will not be obfuscated

This default setting already satisfies most cases. If other requirements exist, symbol obfuscation for related metadata needs to be disabled.

## Disable Symbol Obfuscation for Metadata

There are several ways:

1. Configure disabling `Symbol Obfus` Pass for certain metadata in [Obfuscation Pass](./obfuscation-pass).
2. Configure disabling symbol obfuscation for certain metadata in the rule files of [Symbol Obfuscation](./symbol-obfuscation).
3. Add `[ObfuzIgnore]` attribute to metadata that needs to disable symbol obfuscation in code, see documentation [Obfuz CustomAttributes](./customattributes).
