import { Controller, Get, Post, Body, Query, Patch, Param, Delete, HttpCode, ParseIntPipe, DefaultValuePipe, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { EmailVerifyDto } from '../dto/email-verify.dto';
import { LoginDto } from '../dto/login.dto';
import { UserEntity } from '../entities/user.entity';
import { AuthGuard } from 'src/utile/guard/auth.guard';
import { Roles } from 'src/utile/decorators/roles.decorator';
import { RolesGuard } from 'src/utile/guard/roles.guard';
import { OwnerGuard } from 'src/utile/guard/owner.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<string> {
    const { username, email, password, nickname } = createUserDto;
    return this.usersService.create(username, email, password, nickname); 
  }

  @HttpCode(200)
  @Post('/email-verify')
  async verifyEmail(@Query() verifyEmailDto: EmailVerifyDto): Promise<void> {
    const {verifyToken} = verifyEmailDto;
    await this.usersService.verifyEmail(verifyToken);
  }

  @HttpCode(200)
  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    const { username, password } = loginDto;
    return this.usersService.login(username, password);
  }

  @Get('/exists')
  checkExists(@Query('key') key: 'id'|'email'|'nickname', @Query('value') value: string): Promise<boolean>{
    return this.usersService.checkExists(key, value);
  }

  @Get('/test')
  test(){
    return this.usersService.test();
  }

  @Get()
  @Roles('ADMIN')
  @UseGuards(AuthGuard, RolesGuard)
  findAll(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ): Promise<UserEntity[]> {
    return this.usersService.findAll(offset, limit);
  }

  @Get(':id')
  @UseGuards(AuthGuard, OwnerGuard)
  findOne(@Param('id') id: string): Promise<UserEntity> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, OwnerGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, OwnerGuard)
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}