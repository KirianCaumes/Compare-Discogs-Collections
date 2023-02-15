/**
 * @typedef {object} ApiWantlistResultType
 * @property {object} pagination pagination
 * @property {number} pagination.page page
 * @property {number} pagination.pages pages
 * @property {number} pagination.per_page per_page
 * @property {number} pagination.items items
 * @property {object} pagination.urls urls
 * @property {string} pagination.urls.last last
 * @property {string} pagination.urls.next next
 * @property {object[]} wants wants
 * @property {number} wants.id id
 * @property {string} wants.resource_url resource_url
 * @property {string} wants.date_added date_added
 * @property {object} wants.basic_information basic_information
 * @property {number} wants.basic_information.id id
 * @property {null|number} wants.basic_information.master_id master_id
 * @property {null|string} wants.basic_information.master_url master_url
 * @property {string} wants.basic_information.resource_url resource_url
 * @property {string} wants.basic_information.title title
 * @property {number} wants.basic_information.year year
 * @property {object[]} wants.basic_information.formats formats
 * @property {string} wants.basic_information.formats.name name
 * @property {string} wants.basic_information.formats.qty qty
 * @property {string} wants.basic_information.formats.text text
 * @property {string[]} wants.basic_information.formats.descriptions descriptions
 * @property {object[]} wants.basic_information.labels labels
 * @property {string} wants.basic_information.labels.name name
 * @property {string} wants.basic_information.labels.catno catno
 * @property {string} wants.basic_information.labels.entity_type entity_type
 * @property {string} wants.basic_information.labels.entity_type_name entity_type_name
 * @property {number} wants.basic_information.labels.id id
 * @property {string} wants.basic_information.labels.resource_url resource_url
 * @property {object[]} wants.basic_information.artists artists
 * @property {string} wants.basic_information.artists.name name
 * @property {string} wants.basic_information.artists.anv anv
 * @property {string} wants.basic_information.artists.join join
 * @property {string} wants.basic_information.artists.role role
 * @property {string} wants.basic_information.artists.tracks tracks
 * @property {number} wants.basic_information.artists.id id
 * @property {string} wants.basic_information.artists.resource_url resource_url
 * @property {string} wants.basic_information.thumb thumb
 * @property {string} wants.basic_information.cover_image cover_image
 * @property {string[]} wants.basic_information.genres genres
 * @property {string[]} wants.basic_information.styles styles
 * @property {number} wants.rating rating
 */
