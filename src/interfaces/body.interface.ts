import type { COLLECTION, WANTLIST, COLLECTIONVSWANTLIST } from 'data/constant.data'

export default interface Body {
    /** UserOne */
    userOne: string
    /** UserTwo */
    userTwo: string
    /** Search */
    search: typeof COLLECTION | typeof WANTLIST | typeof COLLECTIONVSWANTLIST
    /** Band */
    band: string
}
