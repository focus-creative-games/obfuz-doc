# EncryptionVM

为什么会产生EncryptionVM？因为Obfuz中的加密服务需要满足以下需求：

1. 实现IEncryptor中所有接口。
2. 支持加密指令组 ops机制。
3. 多态化，即每个开发者都能生成独一无二的加密代码，增大破解难度。

## 加密指令集

为了支持加密指令组ops机制，EncryptionVM需要包含一套固定的加密指令。

EncryptionVM支持以下加密指令原语：

- Add
- Multiple
- Xor
- BitRotate
- AddRotateXor
- AddXorRotate
- MultipleRotateXor
- MultipleXorRotate
- XorAddRotate
- XorMultipleRotate

每个加密指令原语都有一些随机化参数，可确保每条加密指令都不一样。

## 生成加密指令集

Obfuz使用一个确定性的随机算法，根据一个初始的随机种子，生成加密指令集。

- `EncryptionVMSettings.CodeGenerationSecretKey`中配置这个初始的随机化种子。
- `EncryptionVMSettings.EncryptionOpCodeCount`中配置了加密指令集的指令个数。

EncrytpionOpCodeCount必须为2的幂（如64、128、256、1024），默认值为256。最小值为64，最大值虽然没有限制，但不建议超出1024，因为会导致生成的`GeneratedEncryptionVirutalMachine`类的代码过大。

生成算法会随机出每条指令使用的加密指令原语以及该加密原语的随机化参数。

## 生成 EncryptionVM代码

运行菜单`Obfuz/GenerateEncryptionVM`生成加密虚拟机代码，在`EncryptionVMSettings.CodeOutputPath`中配置`GeneratedEncryptionVirtualMachine`类的输出代码文件路径。
默认生成的代码文件为`Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`。

一般来说，GeneratedEncryptionVirutalMachine需要放到AOT程序集中。这样既提高了加密性能，同时也利用il2cpp会将代码编译为机器指令的特点，增加破解难度。

如果没有任何AOT混淆程序集，GeneratedEncryptionVirutalMachine也可以放到热更新程序集中，这样可以实现最大程度的灵活性，每次发布热更新代码时加密虚拟机都不一样。不过放到热更新代码中
不仅会导致加密性能较差，还容易被逆向，因此不推荐这么做。

建议每次发布新主包时修改`CodeGenerationSecretKey`，生成全新的EncryptionVM，以增大破解难度。如果使用了代码热更新技术且`GeneratedEncryptionVirutalMachine`在AOT程序集中，
那么在发布热更新代码时不要修改`CodeGenerationSecretKey`，否则会导致被混淆的热更新程序集执行解密代码出错！
