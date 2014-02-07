node-needle-di
==============

Lightweight Dependency Injection Framework for Node.js.

Needle DI is a simple framework that allows all of your application logic to be wired up in one place, including specifying the modules that need to be loaded, the dependencies between objects and even specifying some details about object lifecycles. It is designed to greatly reduce coupling between parts of the application by allowing the code to not care about the other bits of the codebase as long as they fulfil the appropriate contracts. This gives advantages as far as testing of your code - you can test a module in isolation trivially now, because you write your module to take all of the dependencies passed in instead of implicitly knowing about them - as well as making refactoring of the codebase easier, because as long as the instances passed in meet the required contracts you don't need to care where they came from.

# Examples
Some examples can be seen in the unit tests, but are expounded here for greater clarity.

## Constructing a static value
```
var Needle = require('needle-di');
var needle = Needle.new();
needle.register('static').staticValue(1);
```
In this example, we register an object with the name 'static' and configure it to always return the fixed value 1. If you have a simple value that you want to return, you don't need to worry about factory functions or modules or anything - you simply tell Needle what the value is. This has the advantage that you can then inject this value as a dependency to other objects, and if you change this one definition then you change it everywhere it is injected

## Constructing a dynamic value
```
var Needle = require('needle-di');
var needle = Needle.new();
needle.register('dynamic').factoryFunction(function() { return new Date(); });
```

In this example, we register an object with the name 'dynamic' and configure it with a function to call when the object needs to be instantiated. The function can do anything at all that you want, and the return value is what is used by the Needle container. The static value example above actually makes use of this under the hood by registering a function that returned the passed in static value.

## Dependencies between objects
```
var Needle = require('needle-di');
var needle = Needle.new();
needle.register('a').staticValue(1);
needle.register('b').staticValue(2);
needle.register('c').dependsOn('a').dependsOn('b').factoryFunction(function(args) { return args.a + args.b; });
```

In this example, we register objects with the names 'a' and 'b', that have static values. We then register an object 'c' that has a value computed by adding the other two values together. We register 'c as depending on both 'a' and 'b', and thus when the factory function for 'c' is called it is given an object that contains the built values for 'a' and 'b' that we can trivially access.

## Objects that don't build anything
```
var Needle = require('needle-di');
var needle = Needle.new();
needle.register('a').staticValue(1);
needle.register('b').staticValue(2);
needle.register('c').dependsOn('a').dependsOn('b');
```

It is possible to register an object that doesn't actually build anything. In this case, what is built is actually the args object that was passed in - i.e. the dependencies of the object. The object 'c' above will actually build the following Javascript Object.
```
{'a': 1, 'b': 2}
```
This is useful when you want to have a series of objects pulled together and passed around, and don't want to have to repeat the list of objects in multiple places.

## Objects requiring other files to be loaded
```
var Needle = require('needle-di');
var needle = Needle.new();
needle.register('userDao').requires('./lib/users/dao').factoryFunction(userDao) { return userDao.new(); })
```
If you need to load code from another source file in order to instantiate an object, you can do so by specifying which files are required in the object definition. You can specify as many required sources as you want, and they will all be passed in to your factory function as parameters, in a similar manner to how requirejs works.

### Required Modules and Dependencies
```
var Needle = require('needle-di');
var needle = Needle.new();
needle.register('db.username').staticValue('username');
needle.register('db.password').staticValue('password');
needle.register('userDao').dependsOn('db.username').dependsOn('db.password').requires('./lib/users/dao').factoryFunction(userDao, args) { return userDao.new(args['db.username'], args['db.password']); })
```
If you specify both a list of required modules and a list of dependencies in the container, the arguments passed to the factory function will still correctly contain all of the information. The list of required modules will be passed through first, in the same order that they were registered, and then the final argument will be the configuration object containing all of the dependencies that were defined. Note above that we have dependencies with periods in their name. This doesn't create an object hierarchy in the configuration object, but instead creates keys with periods in their names, so we have to de-reference them in an alternative way

## Object Lifecycles
```
var Needle = require('needle-di');
var needle = Needle.new();
needle.register('now').lazy().prototype().factoryFunction(function() { return new Date(); });
needle.register('startTime').eager().singleton().factoryFunction(function() { return new Date(); });
```

The above defines two objects. One is called 'now' and will always return the current time as of when it was requested. It is defined as being Lazy, which means it will not be constructed until it is needed, and it is defined as being a Prototype Definition, which means that we will create a new instance every time it is requested.

The second is called 'startTime'. This is defined as being Eager, which means it will be created automatically on startup, even if you never actually request it in any of your code, and it is defined as being a Singleton Definition, which means that the created instance will be cached and this same instance will be returned every time it is requested, instead of constructing a new one each time

## Actually getting values from the container
All of the above examples demonstrate how to register object definitions in the container, but not how to actually get the instances out. Doing this makes uses of Promises - we currently use [Q](https://github.com/kriskowal/q), purely because I quite like it.

Once the container is configured, you need to actually build it. This is done as follows:
```
var Needle = require('needle-di');
var needle = Needle.new();
.....
needle.done().then(function(container) {
}, function(error) {
});
```

The first function passed in to the promise will be called with a constructed container that can be used to request the actual objects that you want to work with. The second function is called if the container definition is invalid - for example, if you have any missing dependencies. 

The container itself returns objects using promises as well, since building the objects can be a complicated task sometimes. 

```
var Needle = require('needle-di');
var needle = Needle.new();
.....
needle.done().then(function(container) {
    container.get('express').then(function(express) {
        http.createServer(express).listen(express.get('port'));
    });
});
```

The above defines a container that contains, amongst all else, an object called 'express' that is presumably an instance of an Express3 Application. We then go and get this instance out, and start listening on the configured port. Note how trivial it is to get the instance out and start listening on it, and how all of the complexity is actually in the wiring of the application and not the running of it.
