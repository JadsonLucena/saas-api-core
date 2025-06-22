import { describe, it } from 'node:test'
import assert from 'node:assert'

import { DB, PAGINATION } from '../../../../../src/config.ts'

import SqlBuilder from '../../../../../src/infrastructure/gateway/DB/driver/sql/SqlBuilder.ts'
import { BIND_STYLES, SORT_ORDER } from '../../../../../src/application/ports/IRepository.ts'


describe('filter', () => {
  describe('Simple filter with primitive value', () => {
    it('should generate SQL for buffer value', () => {
      const buffer = Buffer.from('test')
      const result = SqlBuilder<'data', 'files'>({
        filter: {
          data: buffer
        }
      })

      assert.ok(result.sql.startsWith('(data = ?)'))
      assert.deepStrictEqual(result.params, {
        _1_data: buffer
      })
    })

    it('should generate SQL for string value', () => {
      const result = SqlBuilder<'name', 'users'>({
        filter: {
          name: 'John Doe'
        }
      })

      assert.ok(result.sql.startsWith('(name = ?)'))
      assert.deepStrictEqual(result.params, {
        _1_name: 'John Doe'
      })
    })

    it('should generate SQL for number value', () => {
      const result = SqlBuilder<'age', 'users'>({
        filter: {
          age: 30
        }
      })

      assert.ok(result.sql.startsWith('(age = ?)'))
      assert.deepStrictEqual(result.params, {
        _1_age: 30
      })
    })

    it('should generate SQL for boolean value', () => {
      const result = SqlBuilder<'isActive', 'users'>({
        filter: {
          isActive: true
        }
      })

      assert.ok(result.sql.startsWith('(isActive = ?)'))
      assert.deepStrictEqual(result.params, {
        _1_isActive: true
      })
    })

    it('should generate SQL for date value', () => {
      const date = new Date()
      const result = SqlBuilder<'createdAt', 'users'>({
        filter: {
          createdAt: date
        }
      })

      assert.ok(result.sql.startsWith('(createdAt = ?)'))
      assert.deepStrictEqual(result.params, {
        _1_createdAt: date
      })
    })

    it('should generate SQL for null value', () => {
      const result = SqlBuilder<'email', 'users'>({
        filter: {
          email: null
        }
      })

      assert.ok(result.sql.startsWith('(email IS NULL)'))
      assert.deepStrictEqual(result.params, {})
    })

    it('should ignore an undefined value', () => {
      const result = SqlBuilder<'name', 'users'>({
        filter: {
          name: undefined
        }
      })

      assert.strictEqual(result.sql, `OFFSET 0 LIMIT ${PAGINATION.MAX_PER_PAGE}`)
      assert.deepStrictEqual(result.params, {})
    })
  })

  describe('Simple filter with operator', () => {
    it('should generate SQL for equality operator', () => {
      const result = SqlBuilder<'name', 'users'>({
        filter: {
          name: { eq: 'John Doe' }
        }
      })

      assert.ok(result.sql.startsWith('(name = ?)'))
      assert.deepStrictEqual(result.params, {
        _1_name: 'John Doe'
      })
    })

    it('should generate SQL for not equal operator', () => {
      const result = SqlBuilder<'name', 'users'>({
        filter: {
          name: { neq: 'Jane Doe' }
        }
      })

      assert.ok(result.sql.startsWith('(name <> ?)'))
      assert.deepStrictEqual(result.params, {
        _1_name: 'Jane Doe'
      })
    })

    it('should generate SQL for less than operator', () => {
      const result = SqlBuilder<'age', 'users'>({
        filter: {
          age: { lt: 18 }
        }
      })

      assert.ok(result.sql.startsWith('(age < ?)'))
      assert.deepStrictEqual(result.params, {
        _1_age: 18
      })
    })

    it('should generate SQL for less than or equal operator', () => {
      const result = SqlBuilder<'age', 'users'>({
        filter: {
          age: { lte: 65 }
        }
      })

      assert.ok(result.sql.startsWith('(age <= ?)'))
      assert.deepStrictEqual(result.params, {
        _1_age: 65
      })
    })

    it('should generate SQL for greater than operator', () => {
      const result = SqlBuilder<'age', 'users'>({
        filter: {
          age: { gt: 21 }
        }
      })

      assert.ok(result.sql.startsWith('(age > ?)'))
      assert.deepStrictEqual(result.params, {
        _1_age: 21
      })
    })

    it('should generate SQL for greater than or equal operator', () => {
      const result = SqlBuilder<'age', 'users'>({
        filter: {
          age: { gte: 30 }
        }
      })

      assert.ok(result.sql.startsWith('(age >= ?)'))
      assert.deepStrictEqual(result.params, {
        _1_age: 30
      })
    })

    it('should generate SQL for in operator', () => {
      const result = SqlBuilder<'age', 'users'>({
        filter: {
          age: { in: [18, 21, 25] }
        }
      })

      assert.ok(result.sql.startsWith('(age IN (?, ?, ?))'))
      assert.deepStrictEqual(result.params, {
        _1_age: 18,
        _2_age: 21,
        _3_age: 25
      })
    })

    it('should generate SQL for not in operator', () => {
      const result = SqlBuilder<'age', 'users'>({
        filter: {
          age: { nin: [13, 14, 15] }
        }
      })

      assert.ok(result.sql.startsWith('(age NOT IN (?, ?, ?))'))
      assert.deepStrictEqual(result.params, {
        _1_age: 13,
        _2_age: 14,
        _3_age: 15
      })
    })

    it('should generate SQL for between operator', () => {
      const result = SqlBuilder<'age', 'users'>({
        filter: {
          age: { between: [18, 30] }
        }
      })

      assert.ok(result.sql.startsWith('(age BETWEEN ? AND ?)'))
      assert.deepStrictEqual(result.params, {
        _1_age: 18,
        _2_age: 30
      })
    })

    it('should generate SQL for contains operator', () => {
      const result = SqlBuilder<'name', 'users'>({
        filter: {
          name: { contains: 'Doe' }
        }
      })

      assert.ok(result.sql.startsWith('(name LIKE ?)'))
      assert.deepStrictEqual(result.params, {
        _1_name: '%Doe%'
      })
    })

    it('should generate SQL for startsWith operator', () => {
      const result = SqlBuilder<'name', 'users'>({
        filter: {
          name: { startsWith: 'Jo' }
        }
      })

      assert.ok(result.sql.startsWith('(name LIKE ?)'))
      assert.deepStrictEqual(result.params, {
        _1_name: 'Jo%'
      })
    })

    it('should generate SQL for endsWith operator', () => {
      const result = SqlBuilder<'name', 'users'>({
        filter: {
          name: { endsWith: 'Doe' }
        }
      })

      assert.ok(result.sql.startsWith('(name LIKE ?)'))
      assert.deepStrictEqual(result.params, {
        _1_name: '%Doe'
      })
    })
  })

  describe('Simple filter with null values in operators', () => {
    it('should generate SQL for equality operator with null', () => {
      const result = SqlBuilder<'name', 'users'>({
        filter: {
          name: {
            eq: null
          }
        }
      })

      assert.ok(result.sql.startsWith('(name IS NULL)'))
      assert.deepStrictEqual(result.params, {})
    })

    it('should generate SQL for not equal operator with null', () => {
      const result = SqlBuilder<'name', 'users'>({
        filter: {
          name: {
            neq: null
          }
        }
      })

      assert.ok(result.sql.startsWith('(name IS NOT NULL)'))
      assert.deepStrictEqual(result.params, {})
    })
  })

  describe('Filter with arrays', () => {
    it('should generate SQL for simple array', () => {
      const result = SqlBuilder<'tags', 'users'>({
        filter: {
          tags: ['tag1', 'tag2', 'tag3']
        }
      })

      assert.ok(result.sql.startsWith('(tags IN (?, ?, ?))'))
      assert.deepStrictEqual(result.params, {
        _1_tags: 'tag1',
        _2_tags: 'tag2',
        _3_tags: 'tag3'
      })
    })

    it('should generate SQL for array with operators', () => {
      const date = new Date()
      const result = SqlBuilder<'tags', 'users'>({
        filter: {
          tags: {
            in: ['tag1', 1, false, date],
            caseInsensitive: true
          }
        }
      })

      assert.ok(result.sql.startsWith('(LOWER(tags) IN (LOWER(?), ?, ?, ?))'))
      assert.deepStrictEqual(result.params, {
        _1_tags: 'tag1',
        _2_tags: 1,
        _3_tags: false,
        _4_tags: date
      })
    })
  })

  describe('Filter with caseInsensitive and/or collection', () => {
    it('should generate SQL with caseInsensitive', () => {
      const result = SqlBuilder<'name', 'users'>({
        filter: {
          name: {
            eq: 'John Doe',
            caseInsensitive: true
          }
        }
      })

      assert.ok(result.sql.startsWith('(LOWER(name) = LOWER(?))'))
      assert.deepStrictEqual(result.params, {
        _1_name: 'John Doe'
      })
    })

    it('should generate SQL with collection', () => {
      const result = SqlBuilder<'name', 'users'>({
        filter: {
          name: {
            eq: 'John Doe',
            collection: 'users'
          }
        }
      })

      assert.ok(result.sql.startsWith('(users.name = ?)'))
      assert.deepStrictEqual(result.params, {
        _1_name: 'John Doe'
      })
    })

    it('should generate SQL with caseInsensitive and collection', () => {
      const result = SqlBuilder<'name', 'users'>({
        filter: {
          name: {
            eq: 'John Doe',
            caseInsensitive: true,
            collection: 'users'
          }
        }
      })

      assert.ok(result.sql.startsWith('(LOWER(users.name) = LOWER(?))'))
      assert.deepStrictEqual(result.params, {
        _1_name: 'John Doe'
      })
    })
  })

  describe('Logical operators', () => {
    describe('AND operator', () => {
      it('should generate SQL for AND with single condition', () => {
        const result = SqlBuilder<'age', 'users'>({
          filter: {
            AND: {
              age: { gte: 18 }
            }
          }
        })

        assert.ok(result.sql.startsWith('(age >= ?)'))
        assert.deepStrictEqual(result.params, {
          _1_age: 18
        })
      })

      it('should generate SQL for AND with multiple conditions in object', () => {
        const result = SqlBuilder<'age' | 'name', 'users'>({
          filter: {
            AND: {
              age: { gte: 18 },
              name: { eq: 'John' }
            }
          }
        })

        assert.ok(result.sql.startsWith('(age >= ? AND name = ?)'))
        assert.deepStrictEqual(result.params, {
          _1_age: 18,
          _2_name: 'John'
        })
      })

      it('should generate SQL for AND with multiple conditions', () => {
        const result = SqlBuilder<'age', 'users'>({
          filter: {
            AND: [
              { age: { gte: 18 } },
              { age: { lte: 120 } }
            ]
          }
        })

        assert.ok(result.sql.startsWith('(age >= ? AND age <= ?)'))
        assert.deepStrictEqual(result.params, {
          _1_age: 18,
          _2_age: 120
        })
      })
    })

    describe('OR operator', () => {
      it('should generate SQL for OR with single condition', () => {
        const result = SqlBuilder<'age', 'users'>({
          filter: {
            OR: {
              age: { gte: 18 }
            }
          }
        })

        assert.ok(result.sql.startsWith('(age >= ?)'))
        assert.deepStrictEqual(result.params, {
          _1_age: 18
        })
      })

      it('should generate SQL for OR with multiple conditions in object', () => {
        const result = SqlBuilder<'age' | 'name', 'users'>({
          filter: {
            OR: {
              age: { gte: 18 },
              name: { eq: 'John' }
            }
          }
        })

        assert.ok(result.sql.startsWith('(age >= ? OR name = ?)'))
        assert.deepStrictEqual(result.params, {
          _1_age: 18,
          _2_name: 'John'
        })
      })

      it('should generate SQL for OR with multiple conditions', () => {
        const result = SqlBuilder<'age', 'users'>({
          filter: {
            OR: [
              { age: { lt: 18 } },
              { age: { gt: 120 } }
            ]
          }
        })

        assert.ok(result.sql.startsWith('(age < ? OR age > ?)'))
        assert.deepStrictEqual(result.params, {
          _1_age: 18,
          _2_age: 120
        })
      })
    })

    describe('NOT operator', () => {
      it('should generate SQL for NOT with single condition', () => {
        const result = SqlBuilder<'age', 'users'>({
          filter: {
            NOT: {
              age: { gte: 18 }
            }
          }
        })

        assert.ok(result.sql.startsWith('(NOT (age >= ?))'))
        assert.deepStrictEqual(result.params, {
          _1_age: 18
        })
      })

      it('should generate SQL for NOT with multiple conditions in object', () => {
        const result = SqlBuilder<'age' | 'name', 'users'>({
          filter: {
            NOT: {
              age: { gte: 18 },
              name: { eq: 'John' }
            }
          }
        })

        assert.ok(result.sql.startsWith('(NOT (age >= ? AND name = ?))'))
        assert.deepStrictEqual(result.params, {
          _1_age: 18,
          _2_name: 'John'
        })
      })

      it('should generate SQL for NOT with multiple conditions', () => {
        const result = SqlBuilder<'age', 'users'>({
          filter: {
            NOT: [
              { age: { lt: 18 } },
              { age: { gt: 120 } }
            ]
          }
        })

        assert.ok(result.sql.startsWith('(NOT (age < ? AND age > ?))'))
        assert.deepStrictEqual(result.params, {
          _1_age: 18,
          _2_age: 120
        })
      })
    })

    it('should ignore an operator filter with undefined value', () => {
      const result = SqlBuilder<'name', 'users'>({
        filter: {
          AND: undefined,
          OR: undefined,
          NOT: undefined
        }
      })

      assert.strictEqual(result.sql, `OFFSET 0 LIMIT ${PAGINATION.MAX_PER_PAGE}`)
      assert.deepStrictEqual(result.params, {})
    })

    it('should ignore an operator filter with empty object', () => {
      const result = SqlBuilder<'name', 'users'>({
        filter: {
          AND: {},
          OR: {},
          NOT: {}
        }
      })

      assert.strictEqual(result.sql, `OFFSET 0 LIMIT ${PAGINATION.MAX_PER_PAGE}`)
      assert.deepStrictEqual(result.params, {})
    })

    it('should ignore an operator filter with empty array', () => {
      const result = SqlBuilder<'name', 'users'>({
        filter: {
          AND: [],
          OR: [],
          NOT: []
        }
      })

      assert.strictEqual(result.sql, `OFFSET 0 LIMIT ${PAGINATION.MAX_PER_PAGE}`)
      assert.deepStrictEqual(result.params, {})
    })

    it('should ignore an operator filter with empty object array', () => {
      const result = SqlBuilder<'name', 'users'>({
        filter: {
          AND: [{}],
          OR: [{}],
          NOT: [{}]
        }
      })

      assert.strictEqual(result.sql, `OFFSET 0 LIMIT ${PAGINATION.MAX_PER_PAGE}`)
      assert.deepStrictEqual(result.params, {})
    })
  })

  describe('Complex filters', () => {
    it('should generate SQL for complex nested filters', () => {
      const result = SqlBuilder<'age' | 'name', 'users'>({
        filter: {
          AND: {
            OR: {
              NOT: {
                age: { lt: 18 }
              },
              name: { eq: 'John' }
            }
          }
        }
      })

      assert.ok(result.sql.startsWith('(NOT (age < ?) OR name = ?)'))
      assert.deepStrictEqual(result.params, {
        _1_age: 18,
        _2_name: 'John'
      })
    })

    it('should generate SQL with all types', () => {
      const date = new Date()
      const result = SqlBuilder<'name' | 'age' | 'isActive' | 'createdAt' | 'phone' | 'email', 'users'>({
        filter: {
          AND: [
            {
              name: { startsWith: 'J' }
            },
            {
              name: { endsWith: 'e' }
            },
            {
              OR: {
                NOT: {
                  age: { between: [18, 120] },
                  name: { contains: 'Smith' }
                },
                isActive: true,
                createdAt: {
                  gte: date
                },
                AND: {
                  phone: {
                    in: ['123-456-7890', '987-654-3210']
                  },
                  email: {
                    nin: ['john@example.com', 'jane@example.com']
                  }
                }
              }
            }
          ]
        }
      })

      assert.ok(result.sql.startsWith('(name LIKE ? AND name LIKE ? AND (NOT (age BETWEEN ? AND ? AND name LIKE ?) OR isActive = ? OR createdAt >= ? OR (phone IN (?, ?) AND email NOT IN (?, ?))))'))
      assert.deepStrictEqual(result.params, {
        _1_name: 'J%',
        _2_name: '%e',
        _3_age: 18,
        _4_age: 120,
        _5_name: '%Smith%',
        _6_isActive: true,
        _7_createdAt: date,
        _8_phone: '123-456-7890',
        _9_phone: '987-654-3210',
        _10_email: 'john@example.com',
        _11_email: 'jane@example.com'
      })
    })
  })
})

describe('sort', () => {
  it('should generate SQL for sort with ASC', () => {
    const result = SqlBuilder<'name', 'users'>({
      sort: {
        name: SORT_ORDER.ASC
      }
    })

    assert.ok(result.sql.includes('ORDER BY name ASC'))
    assert.deepStrictEqual(result.params, {})
  })

  it('should generate SQL for sort object', () => {
    const result = SqlBuilder<'name', 'users'>({
      sort: {
        name: {
          order: SORT_ORDER.DESC
        }
      }
    })

    assert.ok(result.sql.includes('ORDER BY name DESC'))
    assert.deepStrictEqual(result.params, {})
  })

  it('should generate SQL for sort object with collection', () => {
    const result = SqlBuilder<'name', 'users'>({
      sort: {
        name: {
          order: SORT_ORDER.DESC,
          collection: 'users'
        }
      }
    })

    assert.ok(result.sql.includes('ORDER BY users.name DESC'))
    assert.deepStrictEqual(result.params, {})
  })

  it('should generate SQL for sort from multiples fields', () => {
    const result = SqlBuilder<'name' | 'age', 'users'>({
      sort: {
        name: SORT_ORDER.DESC,
        age: {
          order: SORT_ORDER.ASC,
          collection: 'users'
        }
      }
    })

    assert.ok(result.sql.includes('ORDER BY name DESC, users.age ASC'))
    assert.deepStrictEqual(result.params, {})
  })
})

describe('pagination', () => {
  it('should skip pagination if undefined', () => {
    const result = SqlBuilder<'name', 'users'>({
      bindStyle: BIND_STYLES.NAMED_AT
    })

    assert.strictEqual(result.sql, `OFFSET 0 LIMIT ${PAGINATION.MAX_PER_PAGE}`)
    assert.deepStrictEqual(result.params, {})
  })

  it('should apply default perPage if missing', () => {
    const result = SqlBuilder<'name', 'users'>({
      pagination: {
        page: 1
      }
    })

    assert.strictEqual(result.sql, `OFFSET 0 LIMIT ${PAGINATION.MAX_PER_PAGE}`)
    assert.deepStrictEqual(result.params, {})
  })

  it('should apply pagination with page and perPage', () => {
    const result = SqlBuilder<'name', 'users'>({
      pagination: {
        page: 2,
        perPage: 50
      }
    })

    assert.strictEqual(result.sql, `OFFSET 50 LIMIT 50`)
    assert.deepStrictEqual(result.params, {})
  })
})

describe('bindStyle', () => {
  it('should use positional bind style (?)', () => {
    const result = SqlBuilder<'name', 'users'>({
      filter: {
        name: 'John'
      },
      bindStyle: BIND_STYLES.POSITIONAL_QUESTION
    })

    assert.ok(result.sql.startsWith('(name = ?)'))
    assert.deepStrictEqual(result.params, {
      _1_name: 'John'
    })
  })

  it('should use positional dollar bind style ($1)', () => {
    const result = SqlBuilder<'name', 'users'>({
      filter: {
        name: 'John'
      },
      bindStyle: BIND_STYLES.POSITIONAL_DOLLAR
    })

    assert.ok(result.sql.startsWith('(name = $1)'))
    assert.deepStrictEqual(result.params, {
      _1_name: 'John'
    })
  })

  it('should use named colon style (:param)', () => {
    const result = SqlBuilder<'name', 'users'>({
      filter: {
        name: 'John'
      },
      bindStyle: BIND_STYLES.NAMED_COLON
    })

    assert.ok(result.sql.startsWith('(name = :_1_name)'))
    assert.deepStrictEqual(result.params, {
      _1_name: 'John'
    })
  })

  it('should use named at style (@param)', () => {
    const result = SqlBuilder<'name', 'users'>({
      filter: {
        name: 'John'
      },
      bindStyle: BIND_STYLES.NAMED_AT
    })

    assert.ok(result.sql.startsWith('(name = @_1_name)'))
    assert.deepStrictEqual(result.params, {
      _1_name: 'John'
    })
  })
})

describe('Security', () => {
  it('prevent stack overflow with deep nesting', () => {
    const deepFilter = {
      NOT: {
        AND: {
          OR: {
            NOT: {
              AND: {
                OR: {
                  NOT: {
                    AND: {
                      OR: {
                        NOT: {
                          name: {
                            eq: 'John Doe'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } as const

    assert.throws(() => {
      SqlBuilder<'name', 'users'>({
        filter: deepFilter
      })
    }, {
      message: `Filter depth exceeded the maximum limit of ${DB.MAX_FILTER_DEPTH}`
    })
  })

  it('prevent greedy filter', () => {
    const result = SqlBuilder<'name', 'users'>()

    assert.strictEqual(result.sql, `OFFSET 0 LIMIT ${PAGINATION.MAX_PER_PAGE}`)
    assert.deepStrictEqual(result.params, {})
  })

  it('should not allow SQL injection through filter', () => {
    const result = SqlBuilder<'name', 'users'>({
      filter: {
        name: 'John"; DROP TABLE users; --' // SQL injection attempt
      }
    })

    assert.ok(result.sql.startsWith('(name = ?)'))
    assert.deepStrictEqual(result.params, {
      _1_name: 'John"; DROP TABLE users; --'
    })
  })

  describe('pagination', () => {
    it('should throw error for negative page', () => {
      assert.throws(() => {
        SqlBuilder<'name', 'users'>({
          pagination: {
            page: -1,
            perPage: 10
          }
        })
      }, {
        message: 'page must be a positive number greater than 0'
      })
    })

    it('should throw error for zero page', () => {
      assert.throws(() => {
        SqlBuilder<'name', 'users'>({
          pagination: {
            page: 0,
            perPage: 10
          }
        })
      }, {
        message: 'page must be a positive number greater than 0'
      })
    })

    it('should throw error for negative perPage', () => {
      assert.throws(() => {
        SqlBuilder<'name', 'users'>({
          pagination: {
            page: 1,
            perPage: -10
          }
        })
      }, {
        message: 'perPage must be a positive number greater than 0'
      })
    })

    it('should throw error for zero perPage', () => {
      assert.throws(() => {
        SqlBuilder<'name', 'users'>({
          pagination: {
            page: 1,
            perPage: 0
          }
        })
      }, {
        message: 'perPage must be a positive number greater than 0'
      })
    })

    it('should throw error for perPage greater than MAX_PAGE_SIZE', () => {
      assert.throws(() => {
        SqlBuilder<'name', 'users'>({
          pagination: {
            page: 1,
            perPage: PAGINATION.MAX_PER_PAGE + 1
          }
        })
      }, {
        message: `perPage must be less than or equal to ${PAGINATION.MAX_PER_PAGE}`
      })
    })
  })
})