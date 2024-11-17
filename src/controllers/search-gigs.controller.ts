import { searchGigsService } from '@auth/services/search-gigs.service';
import { IPaginateProps, ISearchResult } from '@jobhunt-microservices/jobhunt-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

class SearchGigsController {
  async gigsSearch(req: Request, res: Response) {
    const { from, size, type } = req.params;
    const { query, delivery_name, min_price, max_price } = req.query;

    const paginate: IPaginateProps = { from, size: parseInt(`${size}`), type };
    const gigs: ISearchResult = await searchGigsService.gigsSearch(
      `${query}`,
      paginate,
      `${delivery_name}`,
      parseInt(`${min_price}`),
      parseInt(`${max_price}`)
    );

    const result = gigs.hits.map((e) => e._source);
    res.status(StatusCodes.OK).json({
      message: 'Search gigs result',
      total: gigs.total,
      data: result
    });
  }

  async singleGigSearchById(req: Request, res: Response) {
    const { id } = req.params;
    const data = await searchGigsService.gigById('gigs', id);
    res.status(StatusCodes.OK).json({
      message: 'Search gig result',
      data: data
    });
  }
}

export const searchGigsController = new SearchGigsController();
