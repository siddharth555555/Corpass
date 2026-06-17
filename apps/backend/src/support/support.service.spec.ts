import { Test, TestingModule } from '@nestjs/testing';
import { SupportService } from './support.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('SupportService', () => {
  let service: SupportService;
  let notificationsService: NotificationsService;

  const mockPrisma = {
    supportMessage: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    }
  };

  const mockNotificationsService = {
    notifyRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<SupportService>(SupportService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a support ticket and produce an admin notification', async () => {
    mockPrisma.supportMessage.create.mockResolvedValue({ id: 10, userId: 1, subject: 'Help' });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, name: 'Alice' });
    mockNotificationsService.notifyRole.mockResolvedValue(undefined);

    await service.createSupportQuery(1, 'Help', 'I need help');

    expect(mockPrisma.supportMessage.create).toHaveBeenCalledWith({
      data: { userId: 1, subject: 'Help', message: 'I need help' },
    });

    // We use setImmediate or just await a microtask to test the fire-and-forget promise
    await new Promise(process.nextTick);

    expect(mockNotificationsService.notifyRole).toHaveBeenCalledWith(
      'ADMIN',
      'SUPPORT_TICKET',
      'New Support Ticket',
      'Alice has raised a new support ticket: Help',
      'SupportTicket',
      '10'
    );
  });
});
