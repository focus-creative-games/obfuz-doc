# ObfuzIgnoreAttribute

如果只是对少量目标禁用混淆，直接在代码中添加`[ObfuzIgnore]`是更便捷的做法。

ObfuzIgnoreAttribute的工作原理跟Obfuscation Pass规则的效果类似，被添加ObfuzIngoreAttribute特性的目标元数据会被禁用所有混淆操作。

## 目标

`[ObfuzIgnore]`可以添加到类型、函数、字段、Property、event上，被添加的元数据会被禁用所有混淆操作。

|[ObfuzIgnore]添加的目标|描述|
|-|-|
|assembly||
|类型|该类型及所有内嵌子类型、成员字段、函数、Property、event都不会被混淆|
|函数|该函数名及参数及函数体都不会被混淆。注意！函数代码中引用的符号如果被混淆或者加密，则仍然会被替换为混淆后的版本。显然必须这么做才能保证正确性。|
|字段|会被禁用符号混淆、字段加密在内的所有可作用于字段的混淆操作|
|property|会被禁用符号混淆在内的所有可作用于Property的混淆操作，但仍然会混淆getter和setter函数。如果想禁止混淆getter和setter函数需要在函数上添加`[ObfuzIgnore]`|
|event|会被禁用符号混淆在内的所有可作用于event的混淆操作，但仍然会混淆add、remove函数。如果想禁止混淆这些函数需要在函数上添加`[ObfuzIgnore]`|

`[ObfuzIgnore]`不能用于Assembly对象，例如`[assembly: ObfuzIgnore]`不会任何效果。想对某个程序集禁用混淆，
只需要将它从混淆列表`AssemblySettings.AssemblyToObfuscate`移除即可。

`[ObfuzIgnore]`会在最后的RemoveObfuzAttributesPass中被移除，因此它只会出现在源码和原始程序集中，不会出现在最终的混淆后的程序集中。

## 示例代码

```csharp

// Class A及所有成员都不会被混淆
[ObfuzIgnore]
public class A
{
  // 不会被混淆
  public int x;

  // 函数名及函数体都不会被混淆
  public int Foo()
  {
    
    return x + 5;
  }

  // 不会被混淆
  public int Value { get => x; set => x = value; }

  // 不会被混淆
  public event Action OnStart;
}

// B的名称被混淆
public class B
{

  // 不会被混淆
  [ObfuzIngore]
  public int x;

  // 会被混淆
  public int y;

  // 函数名及函数体都不会被混淆
  [ObfuzIgnore]
  public int Foo()
  {
    
    return x + 5;
  }

  // 函数名及函数体都会被混淆
  public int Foo2()
  {
    
    return x + 5;
  }

  // 不会被混淆
  [ObfuzIgnore]
  public int Value
  {
    // getter 函数不会被混淆
    [ObfuzIgnore]
    get => x;
    // setter 函数会被混淆
    set => x = value;
  }

  // 会被混淆
  public int Value2
  {
    // getter 函数不会被混淆
    [ObfuzIgnore]
    get => x;
    // setter 函数会被混淆
    set => x = value;
  }

  // 不会被混淆
  [ObfuzIgnore]
  public event Action OnStart;

  // 会被混淆
  [ObfuzIgnore]
  public event Action OnStart2
  {
    // 不会被混淆
    [ObfuzIgnore]
    add => OnStart += value;
    
    // 会被混淆
    remove => OnStart -= value;
  }
}

```
