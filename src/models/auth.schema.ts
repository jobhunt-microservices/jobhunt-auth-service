import { SALT_ROUND } from '@auth/constants/hashing';
import { database } from '@auth/database';
import { IAuthDocument } from '@jobhunt-microservices/jobhunt-shared';
import { compare, hash } from 'bcryptjs';
import { DataTypes, Model, ModelDefined, Optional } from 'sequelize';

interface AuthModelInstanceMethods extends Model {
  prototype: {
    comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
    hashPassword: (password: string) => Promise<string>;
  };
}

type AuthUserCreationAttributes = Optional<IAuthDocument, 'id' | 'createdAt' | 'passwordResetToken' | 'passwordResetExpires'>;

type AuthModelType = ModelDefined<IAuthDocument, AuthUserCreationAttributes> & AuthModelInstanceMethods;

const AuthModel: AuthModelType = database.sequelize.define(
  'auths',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profilePublicId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Date.now
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Date.now
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['username']
      }
    ]
  }
) as AuthModelType;

AuthModel.addHook('beforeCreate', async (auth: Model) => {
  const hashedPassword: string = await hash(auth.dataValues.password as string, SALT_ROUND);
  auth.dataValues.password = hashedPassword;
});

AuthModel.prototype.comparePassword = async function (password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
};

AuthModel.prototype.hashPassword = async function (password: string): Promise<string> {
  return hash(password, SALT_ROUND);
};

AuthModel.sync({});
export { AuthModel };
