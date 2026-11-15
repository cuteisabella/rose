import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  DocumentReference,
  getDocFromServer,
  getDocs,
  getDocsFromServer,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  AppStoreData,
  BlogPost,
  CommentItem,
  ExtraPageItem,
  MemberItem,
  NavMenuItem,
  TipItem,
  VideoItem
} from './types';

export const AUTHORIZED_ADMIN_EMAIL = 'cuteisabellarose@gmail.com';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration (client offline).');
    }
    return false;
  }
}

export function isAuthorizedAdminUser(user: User | null): boolean {
  if (!user || !user.emailVerified) return false;
  return (user.email || '').toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
}

export async function signInAdminWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutAdminGoogle(): Promise<void> {
  await signOut(auth);
}

function deepSanitizeFirestore<T>(value: T): T {
  if (value === undefined) {
    return undefined as T;
  }
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return (Number.isFinite(value) ? value : 0) as T;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => deepSanitizeFirestore(item))
      .filter((item) => item !== undefined) as unknown as T;
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
      if (v !== undefined) {
        const cleaned = deepSanitizeFirestore(v);
        if (cleaned !== undefined) {
          out[k] = cleaned;
        }
      }
    });
    return out as T;
  }
  return String(value) as unknown as T;
}

function sanitizeFirestoreDoc<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return deepSanitizeFirestore(obj) as Record<string, unknown>;
}

function clampString(val: string | undefined, max: number): string {
  const s = typeof val === 'string' ? val : '';
  return s.length > max ? s.slice(0, max) : s;
}

function sanitizeMenuItems(items: NavMenuItem[] | undefined, maxCount: number): NavMenuItem[] {
  if (!Array.isArray(items)) return [];
  return items.slice(0, maxCount).map((item, idx) => ({
    id: clampString(item.id || `nav-${idx}`, 80),
    label: clampString(item.label || '', 120),
    target: clampString(item.target || '/', 300),
    visible: item.visible !== false
  }));
}

function alignStoreForCloudWrite(store: AppStoreData): AppStoreData {
  const aboutPage = store.pages.find((p) => p.id === 'page-about' || p.slug === 'about');
  const conciergePage = store.pages.find((p) => p.id === 'page-concierge' || p.slug === 'concierge');

  const syncedAboutImage = store.settings.aboutImage || aboutPage?.bannerImage || '';
  const syncedConciergeImage = store.settings.conciergeImage || conciergePage?.bannerImage || '';

  return {
    ...store,
    settings: {
      ...store.settings,
      aboutImage: syncedAboutImage,
      conciergeImage: syncedConciergeImage
    },
    pages: store.pages.map((p) => {
      if ((p.id === 'page-about' || p.slug === 'about') && !p.bannerImage && syncedAboutImage) {
        return { ...p, bannerImage: syncedAboutImage };
      }
      if ((p.id === 'page-concierge' || p.slug === 'concierge') && !p.bannerImage && syncedConciergeImage) {
        return { ...p, bannerImage: syncedConciergeImage };
      }
      return p;
    })
  };
}

function buildSitePublicConfigPayload(store: AppStoreData): Record<string, unknown> {
  const s = store.settings;
  const nowIso = new Date().toISOString();
  return sanitizeFirestoreDoc({
    siteNameEn: clampString(s.siteNameEn || 'Isabella Rose', 200),
    taglineEn: clampString(s.taglineEn || 'Official VIP Blog & Members Lounge', 300),
    seoMetaDescription: clampString(s.seoMetaDescription, 500),
    canonicalUrl: clampString(s.canonicalUrl, 500),
    logoUrl: clampString(s.logoUrl, 295000),
    heroBgImage: clampString(s.heroBgImage, 295000),
    avatarImage: clampString(s.avatarImage, 295000),
    aboutImage: clampString(s.aboutImage, 295000),
    tipsFeatureImage1: clampString(s.tipsFeatureImage1, 295000),
    tipsFeatureImage2: clampString(s.tipsFeatureImage2, 295000),
    tipsFeatureImage3: clampString(s.tipsFeatureImage3, 295000),
    conciergeImage: clampString(s.conciergeImage, 295000),
    showreelEmbedLink: clampString(s.showreelEmbedLink, 1000),
    showreelTitle: clampString(s.showreelTitle, 300),
    showreelThumbnail: clampString(s.showreelThumbnail, 295000),
    currencySymbol: clampString(s.currencySymbol || '$', 10),
    vipMonthlyPrice: Number(s.vipMonthlyPrice || 5.99),
    blackDiamondPrice: Number(s.blackDiamondPrice || 14.99),
    paypalMeUrl: clampString(s.paypalMeUrl, 500),
    stripeMonthlyLink: clampString(s.stripeMonthlyLink, 500),
    stripeQuarterlyLink: clampString(s.stripeQuarterlyLink, 500),
    cryptoWalletAddress: clampString(s.cryptoWalletAddress, 300),
    cryptoNetwork: clampString(s.cryptoNetwork, 100),
    instagramUrl: clampString(s.instagramUrl, 500),
    twitterUrl: clampString(s.twitterUrl, 500),
    youtubeUrl: clampString(s.youtubeUrl, 500),
    customHeadHtml: clampString(s.customHeadHtml, 19500),
    customAdSlotHtml: clampString(s.customAdSlotHtml, 19500),
    headerMenuItems: sanitizeMenuItems(s.headerMenuItems, 30),
    footerMenuItems: sanitizeMenuItems(s.footerMenuItems, 40),
    categories: (s.categories || []).slice(0, 50).map((c) => clampString(c, 100)).filter(Boolean),
    frontTexts: store.frontTexts,
    updatedAt: nowIso
  });
}

function buildSiteAdminSecretsPayload(store: AppStoreData): Record<string, unknown> {
  const s = store.settings;
  const rawPasscode = clampString(s.adminPasscode, 100);
  const safePasscode = rawPasscode.length >= 4 ? rawPasscode : 'KineL1525';
  return sanitizeFirestoreDoc({
    adminPasscode: safePasscode,
    contactEmail: clampString(s.contactEmail, 200),
    contactPhone: clampString(s.contactPhone, 100),
    paypalEmail: clampString(s.paypalEmail, 200),
    stripeAccountLabel: clampString(s.stripeAccountLabel, 200),
    updatedAt: new Date().toISOString()
  });
}

interface BatchWriteOp {
  type: 'set' | 'delete';
  ref: DocumentReference;
  data?: Record<string, unknown>;
}

const VALID_DOC_ID_RE = /^[a-zA-Z0-9_-]{1,128}$/;

function buildCollectionSyncOps<T extends { id: string }>(
  collectionName: string,
  items: T[],
  existingIds: string[],
  mapPayload: (item: T, index: number) => Record<string, unknown>
): BatchWriteOp[] {
  const ops: BatchWriteOp[] = [];
  const desiredIds = new Set<string>();

  items.forEach((item, index) => {
    if (!VALID_DOC_ID_RE.test(item.id)) return;
    desiredIds.add(item.id);
    ops.push({
      type: 'set',
      ref: doc(db, collectionName, item.id),
      data: mapPayload(item, index)
    });
  });

  existingIds.forEach((existingId) => {
    if (!desiredIds.has(existingId)) {
      ops.push({
        type: 'delete',
        ref: doc(db, collectionName, existingId)
      });
    }
  });

  return ops;
}

let pendingSaveQueue: Promise<void> = Promise.resolve();

async function executeSaveCloudStore(rawStore: AppStoreData): Promise<void> {
  const store = alignStoreForCloudWrite(rawStore);

  const collectionNames = [
    'site_pages',
    'site_videos',
    'site_blogs',
    'site_tips',
    'site_comments',
    'site_members'
  ] as const;

  let existingSnapshots;
  try {
    existingSnapshots = await Promise.all(
      collectionNames.map((colName) => getDocs(collection(db, colName)))
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'cloud_store_collections');
  }

  const existingIdsMap = new Map<string, string[]>();
  collectionNames.forEach((colName, idx) => {
    existingIdsMap.set(
      colName,
      existingSnapshots[idx].docs.map((d) => d.id)
    );
  });

  // Put site_public/config, site_admin/secrets, and site_pages first so they always commit atomically together
  const ops: BatchWriteOp[] = [
    {
      type: 'set',
      ref: doc(db, 'site_public', 'config'),
      data: buildSitePublicConfigPayload(store)
    },
    {
      type: 'set',
      ref: doc(db, 'site_admin', 'secrets'),
      data: buildSiteAdminSecretsPayload(store)
    },
    ...buildCollectionSyncOps<ExtraPageItem>(
      'site_pages',
      store.pages,
      existingIdsMap.get('site_pages') || [],
      (p, idx) =>
        sanitizeFirestoreDoc({
          ...p,
          titleEn: clampString(p.titleEn || 'Untitled Page', 300),
          titleBn: '',
          slug: clampString(p.slug || p.id, 200),
          bannerImage: p.bannerImage ? clampString(p.bannerImage, 295000) : '',
          content: clampString(p.content, 245000),
          status: p.status === 'draft' ? 'draft' : 'published',
          sortOrder: idx
        })
    ),
    ...buildCollectionSyncOps<VideoItem>(
      'site_videos',
      store.videos,
      existingIdsMap.get('site_videos') || [],
      (v, idx) =>
        sanitizeFirestoreDoc({
          ...v,
          titleEn: clampString(v.titleEn || 'Untitled Media', 300),
          titleBn: '',
          category: clampString(v.category || 'Luxury', 100),
          type: v.type === 'gallery' ? 'gallery' : 'video',
          status: v.status === 'Draft' ? 'Draft' : 'Published',
          thumbnailUrl: clampString(v.thumbnailUrl, 295000),
          galleryImages: Array.isArray(v.galleryImages)
            ? v.galleryImages.slice(0, 30).map((img) => clampString(img, 295000)).filter(Boolean)
            : [],
          sortOrder: idx
        })
    ),
    ...buildCollectionSyncOps<BlogPost>(
      'site_blogs',
      store.blogs,
      existingIdsMap.get('site_blogs') || [],
      (b, idx) =>
        sanitizeFirestoreDoc({
          ...b,
          titleEn: clampString(b.titleEn || 'Untitled Article', 300),
          titleBn: '',
          slug: clampString(b.slug || b.id, 200),
          category: clampString(b.category || 'Journal', 100),
          bannerImage: clampString(b.bannerImage, 295000),
          content: clampString(b.content, 245000),
          status: b.status === 'draft' ? 'draft' : 'published',
          sortOrder: idx
        })
    ),
    ...buildCollectionSyncOps<TipItem>(
      'site_tips',
      store.tips,
      existingIdsMap.get('site_tips') || [],
      (t, idx) =>
        sanitizeFirestoreDoc({
          ...t,
          title: clampString(t.title || 'Untitled Tip', 300),
          category: clampString(t.category || 'Style', 100),
          image: clampString(t.image, 295000),
          content: clampString(t.content, 195000),
          status: t.status === 'draft' ? 'draft' : 'published',
          sortOrder: idx
        })
    ),
    ...buildCollectionSyncOps<CommentItem>(
      'site_comments',
      store.comments,
      existingIdsMap.get('site_comments') || [],
      (c) =>
        sanitizeFirestoreDoc({
          id: c.id,
          postId: clampString(c.postId, 128),
          postTitle: clampString(c.postTitle, 300),
          authorName: clampString(c.authorName || 'Reader', 120),
          commentText: clampString(c.commentText || 'Nice post', 2000),
          createdAt: clampString(c.createdAt || 'Just now', 80),
          status: c.status === 'approved' || c.status === 'rejected' ? c.status : 'pending'
        })
    ),
    ...buildCollectionSyncOps<MemberItem>(
      'site_members',
      store.members,
      existingIdsMap.get('site_members') || [],
      (m) =>
        sanitizeFirestoreDoc({
          id: m.id,
          name: clampString(m.name || 'Member', 150),
          email: clampString(m.email || 'member@example.com', 200),
          tier: m.tier === 'Black Diamond VIP' || m.tier === 'Free' ? m.tier : 'VIP Member',
          status: m.status === 'cancelled' || m.status === 'pending' ? m.status : 'active',
          joinedDate: clampString(m.joinedDate || 'Today', 80),
          paymentMethod: clampString(m.paymentMethod || 'Card', 120),
          amountPaid: clampString(m.amountPaid || '$0', 50)
        })
    )
  ];

  // Commit atomically (single batch when <= 450 ops; otherwise sequential 450-op chunks)
  const BATCH_LIMIT = 450;
  try {
    for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
      const chunk = ops.slice(i, i + BATCH_LIMIT);
      const batch = writeBatch(db);
      chunk.forEach((op) => {
        if (op.type === 'set' && op.data) {
          batch.set(op.ref, op.data);
        } else {
          batch.delete(op.ref);
        }
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'atomic_cloud_store_batch');
  }
}

export function saveCloudStore(store: AppStoreData): Promise<void> {
  const run = pendingSaveQueue
    .catch(() => undefined)
    .then(() => executeSaveCloudStore(store));
  pendingSaveQueue = run.catch(() => undefined);
  return run;
}

export async function submitPublicCommentToCloud(comment: CommentItem): Promise<void> {
  const path = `site_comments/${comment.id}`;
  try {
    await setDoc(
      doc(db, 'site_comments', comment.id),
      sanitizeFirestoreDoc({
        id: comment.id,
        postId: clampString(comment.postId, 128),
        postTitle: clampString(comment.postTitle, 300),
        authorName: clampString(comment.authorName || 'Reader', 120),
        commentText: clampString(comment.commentText, 2000),
        createdAt: clampString(comment.createdAt, 80),
        status: 'pending'
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function submitPublicMemberToCloud(member: MemberItem): Promise<void> {
  const path = `site_members/${member.id}`;
  try {
    await setDoc(
      doc(db, 'site_members', member.id),
      sanitizeFirestoreDoc({
        id: member.id,
        name: clampString(mName(member.name), 150),
        email: clampString(member.email || 'patron@example.com', 200),
        tier: member.tier,
        status: member.status,
        joinedDate: clampString(member.joinedDate, 80),
        paymentMethod: clampString(member.paymentMethod, 120),
        amountPaid: clampString(member.amountPaid, 50)
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

function mName(val: string | undefined): string {
  return val || 'VIP Patron';
}

export async function submitNewsletterSignupToCloud(
  rawEmail: string,
  source: string = 'footer'
): Promise<{ id: string; email: string; subscribedAt: string }> {
  const email = rawEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    throw new Error('Please enter a valid email address.');
  }
  const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const subscribedAt = new Date().toISOString();
  const path = `newsletter_subscribers/${id}`;
  try {
    await setDoc(
      doc(db, 'newsletter_subscribers', id),
      sanitizeFirestoreDoc({
        id,
        email: clampString(email, 200),
        subscribedAt: clampString(subscribedAt, 80),
        source: clampString(source || 'footer', 60)
      })
    );
    return { id, email, subscribedAt };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export interface NewsletterSubscriberSummary {
  count: number;
  latestSubscribedAt?: string;
}

function summarizeNewsletterSnapshot(
  docs: Array<{ data: () => Record<string, unknown> }>
): NewsletterSubscriberSummary {
  let latestSubscribedAt: string | undefined;
  for (const d of docs) {
    const val = d.data()?.subscribedAt;
    if (typeof val === 'string' && val.trim()) {
      if (!latestSubscribedAt || val > latestSubscribedAt) {
        latestSubscribedAt = val;
      }
    }
  }
  return {
    count: docs.length,
    latestSubscribedAt
  };
}

export async function fetchNewsletterSubscribersSummary(): Promise<NewsletterSubscriberSummary> {
  if (!isAuthorizedAdminUser(auth.currentUser)) {
    throw new Error('Connect Google Cloud Sync as authorized admin to load live email subscribers.');
  }
  const path = 'newsletter_subscribers';
  try {
    const snap = await getDocsFromServer(collection(db, path));
    return summarizeNewsletterSnapshot(snap.docs as Array<{ data: () => Record<string, unknown> }>);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeNewsletterSubscribersCount(
  onUpdate: (summary: NewsletterSubscriberSummary) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  if (!isAuthorizedAdminUser(auth.currentUser)) {
    return () => {};
  }
  const path = 'newsletter_subscribers';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      onUpdate(summarizeNewsletterSnapshot(snap.docs as Array<{ data: () => Record<string, unknown> }>));
    },
    (error) => {
      console.error('Firestore Error (newsletter_subscribers listener):', error);
      onError?.(error);
    }
  );
}

function sortByOrder<T extends { sortOrder?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
}

export interface CloudSyncCallbacks {
  onConfig: (settingsPatch: Partial<AppStoreData['settings']>, frontTexts?: AppStoreData['frontTexts']) => void;
  onSecrets?: (secretsPatch: Partial<AppStoreData['settings']>) => void;
  onVideos: (videos: VideoItem[]) => void;
  onBlogs: (blogs: BlogPost[]) => void;
  onTips: (tips: TipItem[]) => void;
  onPages: (pages: ExtraPageItem[]) => void;
  onComments: (comments: CommentItem[]) => void;
  onMembers?: (members: MemberItem[]) => void;
  onCloudState?: (hasConfig: boolean) => void;
  onError?: (err: unknown) => void;
}

export async function pullCloudStoreFromServer(
  isAdmin: boolean,
  callbacks: CloudSyncCallbacks
): Promise<boolean> {
  try {
    const configSnap = await getDocFromServer(doc(db, 'site_public', 'config'));
    if (!configSnap.exists()) {
      callbacks.onCloudState?.(false);
      return false;
    }

    callbacks.onCloudState?.(true);
    const configData = configSnap.data() as Record<string, unknown>;
    const { frontTexts, updatedAt: _u, ...settingsFields } = configData;
    callbacks.onConfig(
      settingsFields as Partial<AppStoreData['settings']>,
      frontTexts as AppStoreData['frontTexts'] | undefined
    );

    const videosQuery = isAdmin
      ? collection(db, 'site_videos')
      : query(collection(db, 'site_videos'), where('status', '==', 'Published'));
    const blogsQuery = isAdmin
      ? collection(db, 'site_blogs')
      : query(collection(db, 'site_blogs'), where('status', '==', 'published'));
    const tipsQuery = isAdmin
      ? collection(db, 'site_tips')
      : query(collection(db, 'site_tips'), where('status', '==', 'published'));
    const pagesQuery = isAdmin
      ? collection(db, 'site_pages')
      : query(collection(db, 'site_pages'), where('status', '==', 'published'));
    const commentsQuery = isAdmin
      ? collection(db, 'site_comments')
      : query(collection(db, 'site_comments'), where('status', '==', 'approved'));

    const [videosSnap, blogsSnap, tipsSnap, pagesSnap, commentsSnap] = await Promise.all([
      getDocsFromServer(videosQuery),
      getDocsFromServer(blogsQuery),
      getDocsFromServer(tipsQuery),
      getDocsFromServer(pagesQuery),
      getDocsFromServer(commentsQuery)
    ]);

    callbacks.onVideos(sortByOrder(videosSnap.docs.map((d) => d.data() as VideoItem & { sortOrder?: number })));
    callbacks.onBlogs(sortByOrder(blogsSnap.docs.map((d) => d.data() as BlogPost & { sortOrder?: number })));
    callbacks.onTips(sortByOrder(tipsSnap.docs.map((d) => d.data() as TipItem & { sortOrder?: number })));
    callbacks.onPages(sortByOrder(pagesSnap.docs.map((d) => d.data() as ExtraPageItem & { sortOrder?: number })));
    callbacks.onComments(
      commentsSnap.docs.map((d) => ({
        authorEmail: '',
        ...(d.data() as Omit<CommentItem, 'authorEmail'>)
      }))
    );

    if (isAdmin) {
      const [secretsSnap, membersSnap] = await Promise.all([
        getDocFromServer(doc(db, 'site_admin', 'secrets')),
        getDocsFromServer(collection(db, 'site_members'))
      ]);
      if (secretsSnap.exists()) {
        const { updatedAt: _su, ...secrets } = secretsSnap.data() as Record<string, unknown>;
        callbacks.onSecrets?.(secrets as Partial<AppStoreData['settings']>);
      }
      callbacks.onMembers?.(membersSnap.docs.map((d) => d.data() as MemberItem));
    }

    return true;
  } catch (error) {
    callbacks.onError?.(error);
    return false;
  }
}

export function subscribeCloudStore(isAdmin: boolean, callbacks: CloudSyncCallbacks): Unsubscribe {
  const unsubs: Unsubscribe[] = [];
  let cloudConfigExists: boolean | null = null;
  const deferredEmptyCollections = new Map<string, () => void>();

  const handleCollectionUpdate = (key: string, isEmpty: boolean, dispatch: () => void) => {
    if (!isEmpty) {
      deferredEmptyCollections.delete(key);
      dispatch();
      return;
    }
    if (cloudConfigExists === true) {
      deferredEmptyCollections.delete(key);
      dispatch();
    } else if (cloudConfigExists === null) {
      // Wait for site_public/config snapshot so an uninitialized DB doesn't wipe local defaults
      deferredEmptyCollections.set(key, dispatch);
    }
  };

  // 1. Public Site Config
  unsubs.push(
    onSnapshot(
      doc(db, 'site_public', 'config'),
      (snap) => {
        if (!snap.exists()) {
          cloudConfigExists = false;
          deferredEmptyCollections.clear();
          callbacks.onCloudState?.(false);
          return;
        }
        cloudConfigExists = true;
        callbacks.onCloudState?.(true);
        const data = snap.data() as Record<string, unknown>;
        const { frontTexts, updatedAt: _u, ...settingsFields } = data;
        callbacks.onConfig(
          settingsFields as Partial<AppStoreData['settings']>,
          frontTexts as AppStoreData['frontTexts'] | undefined
        );

        // Flush any empty collections that arrived before config confirmed cloud is initialized
        if (deferredEmptyCollections.size > 0) {
          Array.from(deferredEmptyCollections.values()).forEach((fn) => fn());
          deferredEmptyCollections.clear();
        }
      },
      (error) => {
        callbacks.onError?.(error);
      }
    )
  );

  // 2. Videos (All for admin, Published only for public)
  const videosQuery = isAdmin
    ? collection(db, 'site_videos')
    : query(collection(db, 'site_videos'), where('status', '==', 'Published'));
  unsubs.push(
    onSnapshot(
      videosQuery,
      (snap) => {
        const list = sortByOrder(snap.docs.map((d) => d.data() as VideoItem & { sortOrder?: number }));
        handleCollectionUpdate('videos', snap.empty, () => callbacks.onVideos(list));
      },
      (error) => callbacks.onError?.(error)
    )
  );

  // 3. Blogs (All for admin, published only for public)
  const blogsQuery = isAdmin
    ? collection(db, 'site_blogs')
    : query(collection(db, 'site_blogs'), where('status', '==', 'published'));
  unsubs.push(
    onSnapshot(
      blogsQuery,
      (snap) => {
        const list = sortByOrder(snap.docs.map((d) => d.data() as BlogPost & { sortOrder?: number }));
        handleCollectionUpdate('blogs', snap.empty, () => callbacks.onBlogs(list));
      },
      (error) => callbacks.onError?.(error)
    )
  );

  // 4. Tips (All for admin, published only for public)
  const tipsQuery = isAdmin
    ? collection(db, 'site_tips')
    : query(collection(db, 'site_tips'), where('status', '==', 'published'));
  unsubs.push(
    onSnapshot(
      tipsQuery,
      (snap) => {
        const list = sortByOrder(snap.docs.map((d) => d.data() as TipItem & { sortOrder?: number }));
        handleCollectionUpdate('tips', snap.empty, () => callbacks.onTips(list));
      },
      (error) => callbacks.onError?.(error)
    )
  );

  // 5. Pages (All for admin, published only for public)
  const pagesQuery = isAdmin
    ? collection(db, 'site_pages')
    : query(collection(db, 'site_pages'), where('status', '==', 'published'));
  unsubs.push(
    onSnapshot(
      pagesQuery,
      (snap) => {
        const list = sortByOrder(snap.docs.map((d) => d.data() as ExtraPageItem & { sortOrder?: number }));
        handleCollectionUpdate('pages', snap.empty, () => callbacks.onPages(list));
      },
      (error) => callbacks.onError?.(error)
    )
  );

  // 6. Comments (All for admin, approved only for public)
  const commentsQuery = isAdmin
    ? collection(db, 'site_comments')
    : query(collection(db, 'site_comments'), where('status', '==', 'approved'));
  unsubs.push(
    onSnapshot(
      commentsQuery,
      (snap) => {
        const list = snap.docs.map((d) => ({
          authorEmail: '',
          ...(d.data() as Omit<CommentItem, 'authorEmail'>)
        }));
        handleCollectionUpdate('comments', snap.empty, () => callbacks.onComments(list));
      },
      (error) => callbacks.onError?.(error)
    )
  );

  // 7. Admin-Only Secrets & Members
  if (isAdmin) {
    unsubs.push(
      onSnapshot(
        doc(db, 'site_admin', 'secrets'),
        (snap) => {
          if (!snap.exists()) return;
          const { updatedAt: _u, ...secrets } = snap.data() as Record<string, unknown>;
          callbacks.onSecrets?.(secrets as Partial<AppStoreData['settings']>);
        },
        (error) => callbacks.onError?.(error)
      )
    );

    unsubs.push(
      onSnapshot(
        collection(db, 'site_members'),
        (snap) => {
          const list = snap.docs.map((d) => d.data() as MemberItem);
          handleCollectionUpdate('members', snap.empty, () => callbacks.onMembers?.(list));
        },
        (error) => callbacks.onError?.(error)
      )
    );
  }

  return () => {
    unsubs.forEach((fn) => fn());
  };
}
