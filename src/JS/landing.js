var items = [
    { content: 'my first widget' }, // will default to location (0,0) and 1x1
    { w: 2, content: '<h1>Hello</h1>' } // will be placed next at (1,0) and 2x1
];
var grid = GridStack.init();
grid.load(items);
console.log("Hello World")