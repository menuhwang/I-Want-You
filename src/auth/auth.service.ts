import * as jwt from 'jsonwebtoken';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import jwtConfig from 'src/config/jwtConfig';
import { ConfigType } from '@nestjs/config';

interface User {
    uuid: string;
    username: string;
    email: string;
}

@Injectable()
export class AuthService {
    private secret: string;

    constructor(
        @Inject(jwtConfig.KEY) private config: ConfigType<typeof jwtConfig>
    ){
        if (!config.key){
            throw new Error('missing JWT KEY');
        }
        this.secret = config.key;
    }
    public login(user: User){
        const payload = { ...user };

        return jwt.sign(payload, this.secret, {
            expiresIn: '1d'
        })
    }
    public verify(jwtString: string) {
        try {
          const payload = jwt.verify(jwtString, this.secret) as (jwt.JwtPayload | string) & User;
  
          const { uuid, username, email } = payload;
  
          return {
            uuid,
            username,
            email,
          }
  
        } catch (e) {
          throw new UnauthorizedException()
        }
      }
}
