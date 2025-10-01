import UUIDVO from '../value-objects/UUIDVO.ts'

export abstract class WeakEntity implements IWeakEntity {
	private _createdAt: Date
	private _updatedAt: Date

	constructor({
		createdAt = new Date(),
		updatedAt
	}: Partial<IWeakEntity> = {}) {
		this.createdAt = createdAt
		this.updatedAt = updatedAt ?? this.createdAt
	}

	get createdAt() {
		return this._createdAt
	}

	private set createdAt(value: Date) {
		if (value.getTime() > Date.now()) {
			throw new Error('createdAt cannot be in the future')
		}

		this._createdAt = value
	}

	get updatedAt() {
		return this._updatedAt
	}

	protected set updatedAt(value: Date) {
		if (value.getTime() < this.createdAt.getTime()) {
			throw new Error('updatedAt cannot be before createdAt')
		}

		this._updatedAt = value
	}
}

export abstract class OpaqueEntity extends WeakEntity implements IOpaqueEntity {
	readonly id: UUIDVO

	constructor({
		id = new UUIDVO(),
		...rest
	}: Partial<IOpaqueEntity> = {}) {
		super(rest)
		this.id = id
	}
}

export abstract class SequentialEntity extends WeakEntity implements ISequentialEntity {
	readonly id: number | bigint

	constructor({
		id = Number.NaN,
		...rest
	}: Partial<ISequentialEntity> = {}) {
		super(rest)
		this.id = id
	}
}

export function Confirmable<T extends Constructor<WeakEntity>>(Base: T) {
  abstract class ConfirmableMixin extends Base implements IConfirmable {
    private _confirmedAt?: Date

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      const { confirmedAt, ...rest } = args[0] ?? {}

			super(rest)

			this.confirmedAt = confirmedAt
    }

		get confirmedAt() {
			return this._confirmedAt
		}

		private set confirmedAt(value: Date | undefined) {
			if (value && value.getTime() < this.createdAt.getTime()) {
				throw new Error('confirmedAt cannot be before createdAt')
			} else if (value?.getTime() !== this._confirmedAt?.getTime()) {
				this.updatedAt = new Date()
			}

			this._confirmedAt = value
		}

		confirm() {
			if (this.isConfirmed()) {
				throw new Error('It is already confirmed')
			} else if ('isDisabled' in this && (this as unknown as IArchivable).isDisabled()) {
				throw new Error('It is disabled')
			} else if ('isSoftDeleted' in this && (this as unknown as IArchivable).isSoftDeleted()) {
				throw new Error('It is soft deleted')
			}

			this.confirmedAt = new Date()
		}

		isConfirmed() {
			return !!this.confirmedAt
		}
  }

	return ConfirmableMixin
}

export function Archivable<T extends Constructor<WeakEntity>>(Base: T) {
	abstract class ArchivableMixin extends Base implements IArchivable {
		private _disabledAt?: Date
		private _deletedAt?: Date

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		constructor(...args: any[]) {
      const { disabledAt, deletedAt, ...rest } = args[0] ?? {}

			super(rest)

			this.disabledAt = disabledAt
			this.deletedAt = deletedAt
		}

		get disabledAt() {
			return this._disabledAt
		}

		private set disabledAt(value: Date | undefined) {
			if (value && value.getTime() < this.createdAt.getTime()) {
				throw new Error('disabledAt cannot be before createdAt')
			} else if (value?.getTime() !== this._disabledAt?.getTime()) {
				this.updatedAt = new Date()
			}

			this._disabledAt = value
		}

		get deletedAt() {
			return this._deletedAt
		}

		private set deletedAt(value: Date | undefined) {
			if (value && value.getTime() < this.createdAt.getTime()) {
				throw new Error('deletedAt cannot be before createdAt')
			} else if (value?.getTime() !== this._deletedAt?.getTime()) {
				this.updatedAt = new Date()
			}

			this._deletedAt = value
		}

		softDelete() {
			if (this.isDisabled()) {
				throw new Error('It is already soft deleted')
			}

			this.deletedAt = new Date()
		}

		restore() {
			if (!this.isDisabled()) {
				throw new Error('It is not disabled')
			}

			this.deletedAt = undefined
		}

		isSoftDeleted() {
			return !!this.deletedAt
		}
		
		enable(): void {
			if (!this.isDisabled()) {
				throw new Error('It is not disabled')
			}

			this.disabledAt = undefined
		}

		disable(): void {
			if (this.isDisabled()) {
				throw new Error('It is already disabled')
			} else if (this.isSoftDeleted()) {
				throw new Error('It is soft deleted')
			}

			this.disabledAt = new Date()
		}

		isDisabled() {
			return !!this.disabledAt
		}
	}

	return ArchivableMixin
}

export function Expirable<T extends Constructor<WeakEntity>>(Base: T) {
	abstract class ExpirableMixin extends Base {
		private _expiresAt?: Date
		private _startAt: Date

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		constructor(...args: any[]) {
			const { expiresAt, startAt, createdAt, ...rest } = args[0] ?? {}

			super(rest)

			this.startAt = startAt ?? createdAt
			this.expiresAt = expiresAt
		}

		get startAt() {
			return this._startAt
		}

		set startAt(value: Date) {
			if (value.getTime() < this.createdAt.getTime()) {
				throw new Error('Start date cannot be before createdAt')
			} else if (value.getTime() > (this.expiresAt?.getTime() ?? Infinity)) {
				throw new Error('Start date cannot be after expiresAt')
			}  else if (value.getTime() !== this._startAt.getTime()) {
				this.updatedAt = new Date()
			}

			this._startAt = value
		}

		get expiresAt() {
			return this._expiresAt
		}

		set expiresAt(value: Date | undefined) {
			if (value && value.getTime() < Date.now()) {
				throw new Error('Expire date cannot be in the past')
			} else if (value && value.getTime() < this.createdAt.getTime()) {
				throw new Error('Expire date cannot be before createdAt')
			} else if (value && value.getTime() < this.startAt.getTime()) {
				throw new Error('Expire date cannot be before startAt')
			} else if (value?.getTime() !== this._expiresAt?.getTime()) {
				this.updatedAt = new Date()
			}

			this._expiresAt = value
		}

		isStarted() {
			return Date.now() > this.startAt.getTime()
		}

		isExpired() {
			return Date.now() > (this.expiresAt?.getTime() ?? Infinity)
		}
	}

	return ExpirableMixin
}

export interface IWeakEntity {
	get createdAt(): Date
	get updatedAt(): Date
}
export interface IOpaqueEntity extends IWeakEntity {
	readonly id: UUIDVO
}
export interface ISequentialEntity extends IWeakEntity {
	readonly id: number | bigint
}
export interface IConfirmable {
	get confirmedAt(): Date | undefined
	confirm(): void
	isConfirmed(): boolean
}
export interface IArchivable {
	get disabledAt(): Date | undefined
	get deletedAt(): Date | undefined
	disable(): void
	enable(): void
	isDisabled(): boolean
	softDelete(): void
	restore(): void
	isSoftDeleted(): boolean
}
export interface IExpirable {
	startAt: Date
	expiresAt?: Date
	isStarted(): boolean
	isExpired(): boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = abstract new (...args: any[]) => T