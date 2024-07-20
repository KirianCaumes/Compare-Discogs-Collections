export default interface ApiCollectionResult {
    /** Pagination */
    pagination: {
        /** Page */
        page: number
        /** Pages */
        pages: number
        /** Per_page */
        per_page: number
        /** Items */
        items: number
        /** Urls */
        urls: {
            /** Last */
            last: string
            /** Next */
            next: string
        }
    }
    /** Releases */
    releases: Array<{
        /** Id */
        id: number
        /** Instance_id */
        instance_id: number
        /** Date_added */
        date_added: string
        /** Rating */
        rating: number
        /** Basic_information */
        basic_information: {
            /** Id */
            id: number
            /** Master_id */
            master_id: null | number
            /** Master_url */
            master_url: null | string
            /** Resource_url */
            resource_url: string
            /** Thumb */
            thumb: string
            /** Cover_image */
            cover_image: string
            /** Title */
            title: string
            /** Year */
            year: number
            /** Formats */
            formats: Array<{
                /** Name */
                name: string
                /** Qty */
                qty: string
                /** Descriptions */
                descriptions: Array<string>
            }>
            /** Labels */
            labels: {
                /** Name */
                name: string
                /** Catno */
                catno: string
                /** Entity_type */
                entity_type: string
                /** Entity_type_name */
                entity_type_name: string
                /** * :/
                id: number
                /** resource_url */
                resource_url: string
            }
            /** Artists */
            artists: Array<{
                /** Name */
                name: string
                /** Anv */
                anv: string
                /** Join */
                join: string
                /** Role */
                role: string
                /** Tracks */
                tracks: string
                /** * :/
                id: number
                /** resource_url */
                resource_url: string
            }>
            /** Genres */
            genres: Array<string>
            /** Styles */
            styles: Array<string>
        }
    }>
    /** Text */
    text: string
}
