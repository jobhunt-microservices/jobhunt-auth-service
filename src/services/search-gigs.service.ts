import { elasticSearch } from '@auth/elasticsearch';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { IPaginateProps, IQueryList, ISearchResult, ISellerGig } from '@jobhunt-microservices/jobhunt-shared';

class SearchGigsService {
  async gigById(index: string, id: string): Promise<ISellerGig> {
    const data: ISellerGig = await elasticSearch.getDocumentById(index, id);
    return data;
  }

  async gigsSearch(searchQuery: string, paginate: IPaginateProps, deliveryTime?: string, min?: number, max?: number) {
    const { from, size, type } = paginate;
    const queryList: IQueryList[] = [
      {
        query_string: {
          fields: ['username', 'title', 'basicTitle', 'description', 'basicDescription', 'categories', 'subCategories', 'tags'],
          query: `*${searchQuery}*`
        }
      },
      {
        term: {
          active: true
        }
      }
    ];
    if (deliveryTime && deliveryTime !== 'undefined') {
      queryList.push({
        query_string: {
          fields: ['expectedDelivery'],
          query: `*${deliveryTime}*`
        }
      });
    }
    if (!isNaN(parseInt(`${min}`)) && !isNaN(parseInt(`${max}`))) {
      queryList.push({
        range: {
          price: {
            gte: min,
            lte: max
          }
        }
      });
    }
    const result: SearchResponse = await elasticSearch.elasticSearchClient.search({
      index: 'gigs',
      size,
      query: {
        bool: {
          must: queryList
        }
      },
      sort: [{ sortId: type === 'forward' ? 'asc' : 'desc' }],
      ...(from !== '0' && { search_after: [from] })
    });
    return {
      total: result.hits.total,
      hits: result.hits.hits
    } as ISearchResult;
  }
}

export const searchGigsService = new SearchGigsService();
