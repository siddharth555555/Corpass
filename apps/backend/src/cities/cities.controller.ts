import { Controller, Get, Query, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const logger = new Logger('CitiesController');
let citiesData: any[] = [];
try {
  const filePath = path.join(process.cwd(), 'src/resources/in.json');
  const fileData = fs.readFileSync(filePath, 'utf-8');
  citiesData = JSON.parse(fileData);
} catch (e) {
  logger.error('Could not load in.json at path:', path.join(process.cwd(), 'src/resources/in.json'), e);
}

@Controller('cities')
export class CitiesController {
  @Get()
  searchCities(@Query('q') q: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    if (!q || q.length < 2) return { data: [], total: 0, page: pageNum, limit: limitNum, totalPages: 0 };
    const query = q.toLowerCase();
    
    const filtered = citiesData
      .filter(city => city.city && city.city.toLowerCase().includes(query))
      .map(city => ({
        name: city.city,
        state: city.admin_name,
        lat: city.lat,
        lng: city.lng
      }));
      
    const total = filtered.length;
    const skip = (pageNum - 1) * limitNum;
    const paginatedData = filtered.slice(skip, skip + limitNum);

    return {
      data: paginatedData,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };
  }
}
