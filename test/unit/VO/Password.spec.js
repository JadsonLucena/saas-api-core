import Password from '../../../build/domain/VO/Password.js'

const MIN_PASSWORD = '   '
const MAX_PASSWORD = 'E#YHP@BunS%pMf2@&umJ?T7wHDVU6YzPEBcdabvn3fKaas5ZcFju&h7YjK+7p5FRzCuaBKWCJ394tYTHP_YF^RTVH-$*!CHZKXeSDHEMZK&wr@s$*u+KqxTPrmJxQm_MdRkZ^p?PZtdGK$dkGU_n?PCg?&X_8!jsX$kJcH=t&5gshDFPVxJS%Sb^TXEp4ZEDLZ6pLg@Mms9_FbJwuHVawNrq-6YDG3zMN&bL6yTEKU=SSLp&JG7czZM%fPmZbxc9Ggqc4k#5R&K!E!ywXsN5&=-df?c-MSP9wY2pPdB6C&#@7#NwWXv5HDHNe=HYHH&F!fV_w=pC28D$fUe2UVJEXVssJh@5w$ArxQu$JARYG^*wSt4zBrpk84j9WQEhL^FYyqu-nETB6+7+#97uG*s%bS^9QXwrtFypNCbuk5m#b8L3vw9!q9_VLdx3@T-tv4_P^499bmxyTw5HExNaJ_*dKFaMrJrFkC_Br6faeMwJet@2CEQNJa+@YvMLm4ZEHC4^2hmeA?SwuGLjYgu!@Z@%92njySAK&%4%TXy&2b_AT#&jq^VdCWY3JnF+9aLNW!MrcLnBW^J8rPNWRfVB$mLAMMDPb99zwrdYVr5%-c+XY29E%fthr*xb84$G+Vv4Bu=k?6aJbZd?E_c@LMVm$ja9e?U@MB35yvrVC-59ha@kqxZtge#pt2Lg57aqU*BXt*cE5T7qKz$Gf$e*s7w6At=4#m_Yn-QVJD2xq7d7RkjQ6bUfe?sMaJqDEQpTzfrBA*p3SL?*VTypCFAJtjBrsXEQJ!d+&-4A&q3?qgj3vWRDRqWYuy6=rVsqXy22JAJ#MRha@hPJQp^+xd*EZ!Bz-69ngh%q!%yKuQA+hL@$UF@tchfWqrL!VVB2U8wLbTC7_@MsZmXXwsvp!8fFP_yky2v_bAr9aUBX&b8CyEA7wXJ8$LF^q9JkXg=5EFb9cdc?wb&WgmzHCV6#$t4gf2Fqfy$5MGryJrsR4urn^4$R!tNYu-uf^=k3%&bDHP9$+95PceewB!-ES_R67wby#29P5e=yX5FHYzP?gWf=$acXT$QVRDPk8^?MNG3tJsk2=yK7@LmS$J?NA!y%WGpYRxQ2g!_^T9GhC8V6+_KT^4HBEC^f_eZxn3RAAs&Y5x^cKh+bah2$BW*cGK8Y7a2$R9qHfJ$n*@yHWtTyJXQcNU!Ang6+BYAE&dWzQA+%G3-Dy$Pyxjy3fpBC=bk4WPHQ3S$XCc5KKMj2w6pL+V$U?D3a4R3kPAa&8&tG-s%4s6E6Y76@F^bEQK3PpVm2Lz%uKkMrfzv2B3-js9aBZHxs$Zp5yaWK9d^NrrhGfMQF$RuYDeLq#2Bngg@@^KF-tU-Pf9dkCU^bv@X!9qu^nxFD_&kcMQ%cAzvjN5a%7KQrTvS_%Fqa!dh77UZNX!rCU6njbT^G*a!bu^$7=B_!u5nUQEZ^9H$htDf9^mBwggu@6x!kzsvVvYmEY56hs=!H#St4^GDjME9$qdk@!U$fgP$Pt*R%2-$y6s%j@yUh$TSew%Cj^M^eEhrJ$enKH&Pe@K*JzdytQq7zTRTWFZ*CZ*k^zv4HRcQE=q^p5A_=XX&uh^weEhWj*7Q95xgQZacvAEQtTm8asKkHjqBy2xAb&uHqnHLSNf8#7qR_m7fM78Sg9Eq84MTpQgLuq3H!4Bd^$u=A4HZ%sxvXUW*KgE+!dc$CTv9GrZwps=Vqe3!TGDnLvJfrcxgZ6px&!_Sbj@EStZ&am6CcLHNfE4LA*Pvh=fPpt3BrDLB2CfSd4a6QntQ?UxQ_-hHyJ3qTYmubHU%DmBctGMMbZFvVstcA+Pktq=VY838Bkj9HUJvF9xB8b^va79PU5PSM=WE&@KGNuKT%Zd7?h2*jqp*vN^fvmX@T3Jq9Y*jM3=8w%b=?CAsT4!L2Seh8-Dj*fp4@CHCk53z$#8XqrTZQ_yq6s6BFUy#tGy@EK@4UvEJ-nCu@hX6hrPrrgCeu@RxY-KuqhHE&*WB=X_YqMFvCngc94uFdXpvxska-RrRPCXt3u28*swP9cFdPZLDpjTzJ4VaV'
const VALID_PASSWORDS = [
  MIN_PASSWORD,
  MAX_PASSWORD,
  '123',
  'abc',
  ' $zW`e 1g '
]
const INVALID_PASSWORDS = [
  '',
  'x',
  'xx'
]
const INVALID_INPUT_TYPES = [
  Infinity,
  NaN,
  [],
  {},
  null,
  false
]

describe('Constructor', () => {
  test('Given that one wants to instantiate the object with an invalid argument', () => {
    INVALID_PASSWORDS.forEach(password => {
      expect(() => new Password(password)).toThrowError(new TypeError('Invalid password'))
    })

    INVALID_INPUT_TYPES.concat(0, undefined).forEach(password => {
      expect(() => new Password(password)).toThrowError(new TypeError('Invalid password'))
    })

    expect(() => new Password(MIN_PASSWORD, {
      minLength: MIN_PASSWORD.length + 1
    })).toThrowError(new TypeError('Invalid password'))
    expect(() => new Password(MIN_PASSWORD, {
      strong: true
    })).toThrowError(new TypeError('Invalid password'))
    expect(() => new Password(MAX_PASSWORD, {
      strong: true
    })).not.toThrow()

    INVALID_INPUT_TYPES.concat(0, 'foo').forEach(input => {
      expect(() => new Password(MIN_PASSWORD, {
        algorithm: input
      })).toThrowError(new TypeError('Invalid algorithm'))
    })
    INVALID_INPUT_TYPES.concat(0, 1.1, Number.MAX_SAFE_INTEGER + 1).forEach(input => {
      expect(() => new Password(MIN_PASSWORD, {
        iterations: input
      })).toThrowError(new TypeError('Invalid iterations'))
    })
    INVALID_INPUT_TYPES.concat(0, 1.1, Number.MAX_SAFE_INTEGER + 1).forEach(input => {
      expect(() => new Password(MIN_PASSWORD, {
        keyLength: input
      })).toThrowError(new TypeError('Invalid keyLength'))
    })
    INVALID_INPUT_TYPES.concat(0, 1.1, Number.MAX_SAFE_INTEGER + 1).forEach(input => {
      expect(() => new Password(MIN_PASSWORD, {
        minLength: input
      })).toThrowError(new TypeError('Invalid minLength'))
    })
    INVALID_INPUT_TYPES.concat(0, '').forEach(input => {
      expect(() => new Password(MIN_PASSWORD, {
        salt: input
      })).toThrowError(new TypeError('Invalid salt'))
    })

    expect(() => new Password(MIN_PASSWORD, {
      algorithm: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat(0, 'foo')),
      iterations: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat(0, 1.1, Number.MAX_SAFE_INTEGER + 1)),
      keyLength: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat(0, 1.1, Number.MAX_SAFE_INTEGER + 1)),
      salt: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat(0, ''))
    })).toThrow(AggregateError)
  })

  test('Given that one wants to instantiate the object with a valid argument', () => {
    VALID_PASSWORDS.forEach(password => {
      expect(() => new Password(password).toString()).not.toThrow()
    })

    const password = new Password(MIN_PASSWORD)
    expect(new Password(password).toString()).toBe(password.toString())
    expect(new Password(password).parse()).toMatchObject(password.parse())
  })
})

describe('Methods', () => {
  test('Given that one wants to parse a password', () => {
    const parsedPassword = new Password(MAX_PASSWORD).parse()

    expect(parsedPassword).toBeDefined()
    expect(parsedPassword?.algorithm).toBe('sha512')
    expect(parsedPassword?.iterations).toBe(100000)
    expect(parsedPassword?.salt.length).toBe(22)
    expect(parsedPassword?.hash.length).toBe(86)
  })

  test('Given that one wants to verify password with invalid arguments', () => {
    INVALID_PASSWORDS.forEach(password => {
      expect(Password.verify(password)).toBeFalsy()
    })

    INVALID_INPUT_TYPES.concat(0, undefined).forEach(password => {
      expect(() => Password.verify(password)).toThrowError(new TypeError('Invalid password'))
    })

    expect(Password.verify(MIN_PASSWORD, {
      minLength: MIN_PASSWORD.length + 1
    })).toBeFalsy()
    expect(Password.verify(MIN_PASSWORD, {
      strong: true
    })).toBeFalsy()

    INVALID_INPUT_TYPES.concat(0, 1.1, Number.MAX_SAFE_INTEGER + 1).forEach(input => {
      expect(() => Password.verify(MIN_PASSWORD, {
        minLength: input
      })).toThrowError(new TypeError('Invalid minLength'))
    })
  })

  test('Given that one wants to verify password with valid arguments', () => {
    VALID_PASSWORDS.forEach(password => {
      expect(Password.verify(password)).toBeTruthy()
    })

    expect(Password.verify(MIN_PASSWORD)).toBeTruthy()
    expect(Password.verify(MAX_PASSWORD)).toBeTruthy()
  })

  test('Given that one wants to verify if a password is strong', () => {
    expect(Password.isStrong(VALID_PASSWORDS[0])).toBeFalsy()
    expect(Password.isStrong(VALID_PASSWORDS[1])).toBeTruthy()
    expect(Password.isStrong(VALID_PASSWORDS[2])).toBeFalsy()
    expect(Password.isStrong(VALID_PASSWORDS[3])).toBeFalsy()
    expect(Password.isStrong(VALID_PASSWORDS[4])).toBeTruthy()
  })

  test('Given that one wants to verify if a password is hashed', () => {
    const password = new Password(MIN_PASSWORD)

    expect(Password.isHashed(MIN_PASSWORD)).toBeFalsy()
    expect(Password.isHashed(password.toString())).toBeTruthy()
  })

  test('Given that one wants to compare two passwords', () => {
    const password = new Password(MIN_PASSWORD)

    INVALID_INPUT_TYPES.concat(0, undefined).forEach(pwd => {
      expect(() => password.equal(pwd)).toThrowError(new TypeError('Invalid password'))
    })

    expect(password.equal(MAX_PASSWORD)).toBeFalsy()
    expect(password.equal(MIN_PASSWORD)).toBeTruthy()
    expect(password.equal(password)).toBeTruthy()
    expect(password.equal(new Password(MIN_PASSWORD, password.parse()))).toBeTruthy()
  })
})
