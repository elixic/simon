import Sequence from './Sequence';

it('can be constructed without error', () => {
    let instance = new Sequence();
    expect(instance).toBeDefined();
});

it('will add a random value between 0 and 3 when add is called without an argument', () => {
    let instance = new Sequence();
    const count = 50;

    for(let i = 0; i < count; i++) {
        instance.add();
    }

    expect(instance.getCount()).toEqual(count);

    do {
        expect(instance.getCurrent()).toBeGreaterThan(-1);
        expect(instance.getCurrent()).toBeLessThan(4);
    } while(instance.getNext());
});

it('will add a random value between 0 and 3 excluding values that are added to the skip list when add is called without an argument', () => {
    let instance = new Sequence();
    const count = 250;

    instance.addSkip(0);

    // pseudo random number generation should encounter a 0 after 250
    // attempts, if this was truely random this test would be harder to write.
    for(let i = 0; i < count; i++) {
        instance.add();
    }

    expect(instance.getCount()).toEqual(count);

    do {
        expect(instance.getCurrent()).toBeGreaterThan(0);
        expect(instance.getCurrent()).toBeLessThan(4);
    } while(instance.getNext());
});

it('can have a value between 0 and 3 added', () => {
    let instance = new Sequence();
    for(let i = -1; i < 5; i++) {
        instance.add(i);
    }

    expect(instance.getCount()).toEqual(4);
});

it('can return the current number in the sequence repeatedly', () => {
    let instance = new Sequence();
    for(let i = 0; i < 4; i++) {
        instance.add(i);
    }

    // the first number in the sequce is 0
    expect(instance.getCurrent()).toEqual(0);
    expect(instance.getCurrent()).toEqual(0);
});

it('can return the next number in the sequence', () => {
    let instance = new Sequence();
    for(let i = 0; i < 4; i++) {
        instance.add(i);
    }

    // the current value in the sequence is 0
    expect(instance.getNext()).toEqual(1);
    expect(instance.getNext()).toEqual(2);
    expect(instance.getNext()).toEqual(3);
});

it('has next will return true until there are no more items in the sequcne', () => {
    let instance = new Sequence();
    const count = 250;

    for(let i = 0; i < count; i++) {
        instance.add();
    }

    for(let i = 0; i < count - 1; i++) {
        expect(instance.hasNext()).toEqual(true);
        instance.moveNext();
    }
});

it('will return all values added to a sequence', () => {
    let instance = new Sequence();
    const source = [0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3];
    let position = 0;

    for(let position = 0; position < source.length; position++) {
        instance.add(source[position]);
    }

    expect(instance.getCount()).toEqual(source.length);

    position = 0;
    do {
        expect(instance.getCurrent()).toEqual(source[position++]);
        instance.moveNext();
    } while(instance.hasNext());

    expect(instance.hasNext()).not.toBeTruthy();
    expect(position + 1).toEqual(instance.getCount());
});

it('will return undefined when calling get current on an empty sequence', () => {
    let instance = new Sequence();

    expect(instance.getCurrent()).toBeUndefined();

});

it('will return undefined when no there is no next number in the sequence', () => {
    let instance = new Sequence();

    // calling get next on an empty sequence is the same as calling get next at the end of a sequence
    expect(instance.getNext()).toBeUndefined();

    instance.add(0); // add an element
    instance.getNext(); // move the pointer

    // calling get next at the end of a sequence returns undefined
    expect(instance.getNext()).toBeUndefined();
});

it('can have the current postion be reset', () => {
    let instance = new Sequence();
    for(let i = 0; i < 4; i++) {
        instance.add(i);
    }

    // get next alwayas moves the pointer ahead before returning the value so we only need to do it
    // 1 fewer times than the numeber of elements in the sequence
    for(let i = 0; i < instance.getCount() - 1; i++) {
        expect(instance.getNext()).toBeDefined();
    }

    expect(instance.getNext()).toBeUndefined();

    instance.resetPointer();

    for(let i = 0; i < instance.getCount() - 1; i++) {
        expect(instance.getNext()).toBeDefined();
    }
});

it('can have the sequence reset', () => {
    let instance = new Sequence();
    const count = 4;
    for(let i = 0; i < count; i++) {
        instance.add(i);
    }

    expect(instance.getCount()).toEqual(count);
    expect(instance.getCurrent()).toEqual(0);

    instance.reset();

    expect(instance.getCount()).toEqual(0);
    expect(instance.getCurrent()).not.toBeDefined();
});

it('can have the sequence reset while maintating the skip list', () => {
    let instance = new Sequence();
    const count = 250;

    instance.addSkip(0);

    for(let i = 0; i < count; i++) {
        instance.add();
    }

    expect(instance.getCount()).toEqual(count);

    do {
        expect(instance.getCurrent()).toBeGreaterThan(0);
        expect(instance.getCurrent()).toBeLessThan(4);
    } while(instance.getNext() !== undefined);

    instance.reset(true);

    expect(instance.getCount()).toEqual(0);
    expect(instance.getCurrent()).not.toBeDefined();

    for(let i = 0; i < count; i++) {
        instance.add();
    }

    expect(instance.getCount()).toEqual(count);

    do {
        expect(instance.getCurrent()).toBeGreaterThan(0);
        expect(instance.getCurrent()).toBeLessThan(4);
    } while(instance.getNext() !== undefined);

});

it('can recall the previous sequence', () => {
    let instance = new Sequence();
    const count = 250;
    let previous = [];
    let position = 0;
    let str = "";

    for(let i = 0; i < count; i++) {
        instance.add();
    }

    expect(instance.getCount()).toEqual(count);

    do {
        previous.push(instance.getCurrent());
    } while(instance.moveNext())

    expect(previous.length).toEqual(instance.getCount());

    instance.reset();

    expect(instance.getCount()).toEqual(0);
    expect(instance.loadLast()).toBeTruthy();
    expect(instance.getCount()).toEqual(previous.length);
    instance.resetPointer();

    do {
        expect(instance.getCurrent()).toEqual(previous[position++]);
    } while(instance.moveNext());
});

it('can recall the previous longest sequence', () => {
    let instance = new Sequence();
    const shortCount = 100;
    const longCount = 250;
    let longest = [];
    let position = 0;
    let str = "";

    for(let i = 0; i < longCount; i++) {
        instance.add();
    }

    expect(instance.getCount()).toEqual(longCount);

    do {
        longest.push(instance.getCurrent());
    } while(instance.moveNext());

    expect(longest.length).toEqual(instance.getCount());

    instance.reset();
    for(let i = 0; i < shortCount; i++) {
        instance.add();
    }

    expect(instance.getCount()).toEqual(shortCount);
    expect(instance.loadLongest()).toBeTruthy();
    expect(instance.getCount()).toEqual(longest.length);
    instance.resetPointer();

    do {
        expect(instance.getCurrent()).toEqual(longest[position++]);
    } while(instance.moveNext());
});
