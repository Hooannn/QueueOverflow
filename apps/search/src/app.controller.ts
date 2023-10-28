import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SearchService } from './search.service';

@Controller()
export class AppController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  getRoot(): string {
    return 'ok';
  }

  @Get('/search')
  async search() {
    try {
      return await this.searchService.search();
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/index')
  async createIndex(@Body('indexName') indexName: string) {
    try {
      return await this.searchService.createIndex(indexName);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/indexing/document')
  async indexingDocument(
    @Body('indexName') indexName: string,
    @Body('documentId') documentId: string,
    @Body('document') document: any,
  ) {
    try {
      return await this.searchService.indexingDocument(
        indexName,
        documentId,
        document,
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('/document')
  async updateDocument(
    @Body('indexName') indexName: string,
    @Body('documentId') documentId: string,
    @Body('document') document: any,
  ) {
    try {
      return await this.searchService.updateDocument(
        indexName,
        documentId,
        document,
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/document')
  async getDocument(
    @Query('documentId') documentId: string,
    @Query('indexName') indexName: string,
  ) {
    try {
      return await this.searchService.getDocument(indexName, documentId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
