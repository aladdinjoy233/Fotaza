const Photo = require('./models/Photo')
const User = require('./models/User')
const Category = require('./models/Category')
const Right = require('./models/Right')
const Tag = require('./models/Tag')
const UserTag = require('./models/UserTag')
const PhotoComment = require('./models/PhotoComment')
const PhotoRating = require('./models/PhotoRating')

Photo.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' })
Photo.belongsTo(Category, { foreignKey: 'category_id', targetKey: 'id' })
Photo.belongsTo(Right, { foreignKey: 'rights_id', targetKey: 'id' })

// Una foto puede tener muchas tags, y un tag puede
// pertenecer a muchas fotos
Photo.belongsToMany(Tag, { through: 'photo_tags', foreignKey: 'photo_id' })
Tag.belongsToMany(Photo, { through: 'photo_tags', foreignKey: 'tag_id' })

// Un usuario puede tener muchas tags, y un tag puede
// pertenecer a muchos usuarios
User.belongsToMany(Tag, { through: UserTag, foreignKey: 'user_id' })
Tag.belongsToMany(User, { through: UserTag, foreignKey: 'tag_id' })

// Photo ratings
User.belongsToMany(Photo, { through: PhotoRating, foreignKey: 'user_id' })
Photo.belongsToMany(User, { through: PhotoRating, foreignKey: 'photo_id' })

User.hasMany(PhotoRating, { foreignKey: 'user_id' })
Photo.hasMany(PhotoRating, { foreignKey: 'photo_id' })

// Photo comments
User.hasMany(PhotoComment, { foreignKey: 'user_id' })
PhotoComment.belongsTo(User, { foreignKey: 'user_id' })

Photo.hasMany(PhotoComment, { foreignKey: 'photo_id' })
PhotoComment.belongsTo(Photo, { foreignKey: 'photo_id' })