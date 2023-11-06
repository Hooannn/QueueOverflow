import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async search() {
    return await this.elasticsearchService.search();
  }

  async indexingDocuments(indexName: string, documents: any[]) {
    const operations = documents.flatMap((doc) => [
      { index: { _index: indexName, _id: doc.id ?? undefined } },
      doc,
    ]);
    return await this.elasticsearchService.bulk({ refresh: true, operations });
  }

  async createIndex(indexName: string) {
    return await this.elasticsearchService.indices.create({
      index: indexName,
    });
  }

  async deleteIndex(indexName: string) {
    return await this.elasticsearchService.indices.delete({
      index: indexName,
    });
  }

  async deleteDocument(indexName: string, documentId: string) {
    return await this.elasticsearchService.delete({
      index: indexName,
      id: documentId,
    });
  }

  async indexingDocument(indexName: string, document: any) {
    return await this.elasticsearchService.index({
      index: indexName,
      id: document.id ?? undefined,
      document: document,
    });
  }

  async getDocument(indexName: string, documentId: string) {
    return await this.elasticsearchService.get({
      index: indexName,
      id: documentId,
    });
  }

  async updateDocument(indexName: string, documentId: string, document: any) {
    return await this.elasticsearchService.update({
      index: indexName,
      id: documentId,
      doc: document,
    });
  }
}
