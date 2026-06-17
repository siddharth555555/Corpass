import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;

  const mockPrisma = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a notification scoped to user', async () => {
    mockPrisma.notification.create.mockResolvedValue({ id: '1', userId: 1 });
    const result = await service.create(1, 'SYSTEM', 'Title', 'Message');
    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: 1, type: 'SYSTEM' }),
    });
    expect(result.userId).toBe(1);
  });

  it('should list notifications scoped to user', async () => {
    mockPrisma.notification.findMany.mockResolvedValue([{ id: '1', userId: 1 }]);
    await service.getNotifications(1);
    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 1 } })
    );
  });

  it('should only mark read if ownership matches (userId matches)', async () => {
    await service.markAsRead(1, 'notif-1');
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { id: 'notif-1', userId: 1 },
      data: expect.objectContaining({ isRead: true }),
    });
  });
});
