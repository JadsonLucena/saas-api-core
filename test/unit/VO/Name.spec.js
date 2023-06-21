import Name from '../../../build/domain/VO/Name.js'

const MIN_NAME = {
  firstName: 'John',
  lastName: 'Doe'
}
const MAX_NAME = {
  firstName: 'Barnaby',
  lastName: 'Marmaduke Aloysius Benjy Cobweb Dartagnan Egbert Felix Gaspar Humbert Ignatius Jayden Kasper Leroy Maximilian Neddy Obiajulu Pepin Quilliam Rosencrantz Sexton Teddy Upwood Vivatma Wayland Xylon Yardley Zachary Usansky'
}
const VALID_NAMES = [
  Object.values(MIN_NAME).join(' '),
  Object.values(MAX_NAME).join(' '),
  '  John  Doe  ',
  'Björk Guðmundsdóttir',
  'Anna Škodenková',
  'L\'Wren Scott',
  '山田 太郎', // Japonês
  '홍 길 동', // Coreano
  '张 三', // Chinês
  'أحمد محمد', // Árabe
  'Иван Иванов' // Russo
]
const INVALID_NAMES = [
  '',
  'John',
  'a1b2 c3d4',
  'J0hn  Do&',
  'Red Wacky League Antlez Broke the Stereo Neon Tide Bring Back Honesty Coalition Feedback Hand of Aces Keep Going Captain Let\'s Pretend Lost State of Dance Paper Taxis Lunar Road Up Down Strange All and I Neon Sheep Eve Hornby Faye Bradley AJ Wilde Michael Rice Dion Watts Matthew Appleyard John Ashurst Lauren Swales Zoe Angus Jaspreet Singh Emma Matthews Nicola Brown Leanne Pickering Victoria Davies Rachel Burnside Gil Parker Freya Watson Alisha Watts James Pearson Jacob Sotheran Darley Beth Lowery Jasmine Hewitt Chloe Gibson Molly Farquhar Lewis Murphy Abbie Coulson Nick Davies Harvey Parker Kyran Williamson Michael Anderson Bethany Murray Sophie Hamilton Amy Wilkins Emma Simpson Liam Wales Jacob Bartram Alex Hooks Rebecca Miller Caitlin Miller Sean McCloskey Dominic Parker Abbey Sharpe Elena Larkin Rebecca Simpson Nick Dixon Abbie Farrelly Liam Grieves Casey Smith Liam Downing Ben Wignall Elizabeth Hann Danielle Walker Lauren Glen James Johnson Ben Ervine Kate Burton James Hudson Daniel Mayes Matthew Kitching Josh Bennett Evolution Dreams'
]
const INVALID_INPUT_TYPES = [
  Infinity,
  NaN,
  [],
  null,
  false
]

describe('Constructor', () => {
  test('Given that one wants to instantiate the object with invalid arguments', () => {
    INVALID_NAMES.forEach(name => {
      expect(() => new Name(name)).toThrowError(new TypeError('Invalid name'))
    })

    expect(() => new Name({})).toThrowError(new TypeError('Invalid firstName'))
    expect(() => new Name({
      firstName: ''
    })).toThrowError(new TypeError('Invalid name'))

    INVALID_INPUT_TYPES.concat('', 0, undefined).forEach(name => {
      expect(() => new Name(name)).toThrowError(new TypeError('Invalid name'))
    })

    INVALID_INPUT_TYPES.concat({}, 0, undefined).map(input => Object.assign(JSON.parse(JSON.stringify(MIN_NAME)), {
      firstName: input
    })).forEach(input => {
      expect(() => new Name(input)).toThrowError(new TypeError('Invalid firstName'))
    })
    INVALID_INPUT_TYPES.concat({}, 0).map(input => Object.assign(JSON.parse(JSON.stringify(MIN_NAME)), {
      lastName: input
    })).forEach(input => {
      expect(() => new Name(input)).toThrowError(new TypeError('Invalid lastName'))
    })

    expect(() => new Name({
      firstName: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat({}, 0, undefined)),
      lastName: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat({}, 0))
    })).toThrow(AggregateError)

    expect(() => new Name(MIN_NAME, {
      minAmountOfLastNames: 2
    })).toThrowError(new TypeError('Invalid name'))
    expect(() => new Name(MIN_NAME, {
      minLength: Object.values(MIN_NAME).join(' ').length + 1
    })).toThrowError(new TypeError('Invalid name'))
    expect(() => new Name(MIN_NAME, {
      maxLength: Object.values(MIN_NAME).join(' ').length - 1
    })).toThrowError(new TypeError('Invalid name'))

    INVALID_INPUT_TYPES.concat({}, -1, 1.1, Number.MAX_SAFE_INTEGER + 1).forEach(input => {
      expect(() => new Name(MIN_NAME, {
        minAmountOfLastNames: input
      })).toThrowError(new TypeError('Invalid minAmountOfLastNames'))
    })
    INVALID_INPUT_TYPES.concat({}, 0, 1.1, Number.MAX_SAFE_INTEGER + 1).forEach(input => {
      expect(() => new Name(MIN_NAME, {
        minLength: input
      })).toThrowError(new TypeError('Invalid minLength'))
    })
    INVALID_INPUT_TYPES.concat({}, 0, 1.1, Number.MAX_SAFE_INTEGER + 1).forEach(input => {
      expect(() => new Name(MIN_NAME, {
        maxLength: input
      })).toThrowError(new TypeError('Invalid maxLength'))
    })

    expect(() => new Name(MIN_NAME, {
      minLength: 2,
      maxLength: 1
    })).toThrowError(new SyntaxError('Invalid maxLength'))

    expect(() => new Name(MIN_NAME, {
      minAmountOfLastNames: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat({}, -1, 1.1, Number.MAX_SAFE_INTEGER + 1)),
      minLength: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat({}, 0, 1.1, Number.MAX_SAFE_INTEGER + 1)),
      maxLength: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat({}, 0, 1.1, Number.MAX_SAFE_INTEGER + 1))
    })).toThrow(AggregateError)
  })

  test('Given that one wants to instantiate the object with valid arguments', () => {
    VALID_NAMES.forEach(name => {
      expect(new Name(name).toString()).toBe(name.replace(/\s{2,}/g, ' ').trim())
    })

    expect(new Name(MIN_NAME.firstName, {
      minAmountOfLastNames: 0
    }).toString()).toBe(MIN_NAME.firstName)
    expect(new Name('a b', {
      minLength: 3
    }).toString()).toBe('a b')

    const minName = new Name(MIN_NAME)
    expect(new Name(minName).toString()).toBe(minName.toString())
    expect(new Name(minName).parse()).toMatchObject(minName.parse())

    // Ignore Case
    expect(new Name(MAX_NAME).localeCompare(Object.values(MAX_NAME).join(' ').toUpperCase(), undefined, { sensitivity: 'accent' }) === 0).toBeTruthy()
  })
})

describe('Methods', () => {
  test('Given that one wants to parse a name', () => {
    const parsedName = new Name(MIN_NAME).parse()

    expect(parsedName).toBeDefined()
    expect(parsedName?.firstName).toBe(MIN_NAME.firstName)
    expect(parsedName?.lastName).toBe(MIN_NAME.lastName)
  })

  test('Given that one wants to verify a name with invalid arguments', () => {
    INVALID_NAMES.forEach(name => {
      expect(Name.verify(name)).toBeFalsy()
    })

    expect(() => Name.verify({})).toThrowError(new TypeError('Invalid firstName'))
    expect(Name.verify('')).toBeFalsy()
    expect(Name.verify({
      firstName: ''
    })).toBeFalsy()

    INVALID_INPUT_TYPES.concat(0, undefined).forEach(name => {
      expect(() => Name.verify(name)).toThrowError(new TypeError('Invalid name'))
    })

    INVALID_INPUT_TYPES.concat({}, 0, undefined).map(input => Object.assign(JSON.parse(JSON.stringify(MIN_NAME)), {
      firstName: input
    })).forEach(input => {
      expect(() => Name.verify(input)).toThrowError(new TypeError('Invalid firstName'))
    })
    INVALID_INPUT_TYPES.concat({}, 0).map(input => Object.assign(JSON.parse(JSON.stringify(MIN_NAME)), {
      lastName: input
    })).forEach(input => {
      expect(() => Name.verify(input)).toThrowError(new TypeError('Invalid lastName'))
    })

    expect(() => Name.verify({
      firstName: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat({}, 0, undefined)),
      lastName: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat({}, 0))
    })).toThrow(AggregateError)

    expect(Name.verify(MIN_NAME, {
      minAmountOfLastNames: 2
    })).toBeFalsy()
    expect(Name.verify(MIN_NAME, {
      minLength: Object.values(MIN_NAME).join(' ').length + 1
    })).toBeFalsy()
    expect(Name.verify(MIN_NAME, {
      maxLength: Object.values(MIN_NAME).join(' ').length - 1
    })).toBeFalsy()

    INVALID_INPUT_TYPES.concat({}, -1, 1.1, Number.MAX_SAFE_INTEGER + 1).forEach(input => {
      expect(() => Name.verify(MIN_NAME, {
        minAmountOfLastNames: input
      })).toThrowError(new SyntaxError('Invalid minAmountOfLastNames'))
    })
    INVALID_INPUT_TYPES.concat({}, 0, 1.1, Number.MAX_SAFE_INTEGER + 1).forEach(input => {
      expect(() => Name.verify(MIN_NAME, {
        minLength: input
      })).toThrowError(new SyntaxError('Invalid minLength'))
    })
    INVALID_INPUT_TYPES.concat({}, 0, 1.1, Number.MAX_SAFE_INTEGER + 1).forEach(input => {
      expect(() => Name.verify(MIN_NAME, {
        maxLength: input
      })).toThrowError(new SyntaxError('Invalid maxLength'))
    })

    expect(() => Name.verify(MIN_NAME, {
      minLength: 2,
      maxLength: 1
    })).toThrowError(new SyntaxError('Invalid maxLength'))

    expect(() => Name.verify(MIN_NAME, {
      minAmountOfLastNames: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat({}, -1, 1.1, Number.MAX_SAFE_INTEGER + 1)),
      minLength: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat({}, 0, 1.1, Number.MAX_SAFE_INTEGER + 1)),
      maxLength: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat({}, 0, 1.1, Number.MAX_SAFE_INTEGER + 1))
    })).toThrow(AggregateError)
  })

  test('Given that one wants to verify a name with valid arguments', () => {
    VALID_NAMES.forEach(name => {
      expect(Name.verify(name)).toBeTruthy()
    })

    expect(Name.verify(MIN_NAME.firstName, {
      minAmountOfLastNames: 0
    })).toBeTruthy()
    expect(Name.verify('a b', {
      minLength: 3
    })).toBeTruthy()

    expect(Name.verify(MIN_NAME)).toBeTruthy()
    expect(Name.verify(MAX_NAME)).toBeTruthy()
  })
})
