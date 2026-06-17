import { Controller, Get, Query } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

let citiesData: any[] = [];
try {
  const filePath = path.join(process.cwd(), 'src/resources/in.json');
  const fileData = fs.readFileSync(filePath, 'utf-8');
  citiesData = JSON.parse(fileData);
} catch (e) {
  console.error('Could not load in.json at path:', path.join(process.cwd(), 'src/resources/in.json'), e);
}

@Controller('cities')
export class CitiesController {
  @Get()
  searchCities(@Query('q') q: string) {
    if (!q || q.length < 2) return [];
    const query = q.toLowerCase();
    
    // Filter and take max 20 results for performance
    const results = citiesData
      .filter(city => city.city && city.city.toLowerCase().includes(query))
      .slice(0, 20)
      .map(city => ({
        name: city.city,
        state: city.admin_name,
        lat: city.lat,
        lng: city.lng
      }));
      
    return results;
  }
}
