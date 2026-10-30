'use client';
import React, { useState } from 'react';
import { Edit3, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useApp } from './context';
import { Button, Field, Modal, Banner, Pill } from './ui';
export function MediaEditor({
  lessons,
  references,
  onChange,
}: {
  lessons: any[];
  references: any[];
  onChange: () => void;
}) {
  const { t, tr, api, notify } = useApp();
  const [kind, setKind] = useState<'image' | 'reference'>('image'),
    [editor, setEditor] = useState<any>(null),
    [busy, setBusy] = useState(false),
    [filter, setFilter] = useState('');
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`admin/${kind === 'image' ? 'images' : 'references'}/${editor.id}`, {
        method: 'PATCH',
        body: JSON.stringify(editor),
      });
      setEditor(null);
      onChange();
      notify(
        t(
          'Metadata saved. Associated lessons need a new review.',
          'حُفظت البيانات. تحتاج الدروس المرتبطة إلى مراجعة جديدة.',
        ),
      );
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="panel admin-media-editor">
      <div className="section-heading">
        <div>
          <h2>{t('Edit media & source associations', 'تحرير الوسائط وربط المصادر')}</h2>
          <p>
            {t(
              'Attribution and classification are part of the scientific record.',
              'النسبة والتصنيف جزء من السجل العلمي.',
            )}
          </p>
        </div>
      </div>
      <Field label={t('Filter by lesson', 'التصفية حسب الدرس')}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">{t('All lessons', 'كل الدروس')}</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {tr(l)}
            </option>
          ))}
        </select>
      </Field>
      <div className="admin-media-grid">
        {lessons
          .filter((l) => !filter || l.id === filter)
          .flatMap((l) =>
            l.images.map((im: any) => (
              <article key={im.id}>
                <img src={im.url} alt={tr(im, 'alt')} loading="lazy" />
                <div>
                  <Pill>
                    {im.kind === 'ILLUSTRATION'
                      ? t('Illustration', 'تصور توضيحي')
                      : t('Observation', 'رصد')}
                  </Pill>
                  <h3>{tr(im)}</h3>
                  <small>{tr(l)}</small>
                  <p>{tr(im, 'caption')}</p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setKind('image');
                      setEditor({ ...im });
                    }}
                  >
                    <Edit3 size={14} />
                    {t('Edit metadata', 'حرّر البيانات')}
                  </Button>
                </div>
              </article>
            )),
          )}
      </div>
      <h3>{t('Reference records', 'سجلات المراجع')}</h3>
      <div className="editable-references">
        {references
          .filter((r) => !filter || r.lessons.some((l: any) => l.lessonId === filter))
          .map((r) => (
            <div key={r.id}>
              <a href={r.url} target="_blank" rel="noreferrer">
                <strong>{r.title}</strong>
                <span>{r.publisher}</span>
                <ExternalLink size={13} />
              </a>
              <Button
                variant="ghost"
                onClick={() => {
                  setKind('reference');
                  setEditor({ ...r, lessonIds: r.lessons.map((l: any) => l.lessonId) });
                }}
              >
                <Edit3 size={14} />
                {t('Edit & associate', 'حرّر واربط')}
              </Button>
            </div>
          ))}
      </div>
      {editor && (
        <Modal
          wide
          title={
            kind === 'image'
              ? t('Scientific image metadata', 'بيانات الصورة العلمية')
              : t('Reference & lesson associations', 'المرجع وربطه بالدروس')
          }
          onClose={() => {
            if (!busy) setEditor(null);
          }}
        >
          <form onSubmit={save}>
            <Banner tone="warning">
              {t(
                'Saving changes returns affected lessons to draft. Recheck the source and attribution before approving again.',
                'يعيد الحفظ الدروس المتأثرة إلى المسودة. تحقق من المصدر والحقوق قبل الاعتماد مجددًا.',
              )}
            </Banner>
            {kind === 'image' ? (
              <>
                <Field label={t('Associated lesson', 'الدرس المرتبط')}>
                  <select
                    value={editor.lessonId}
                    onChange={(e) => setEditor((v: any) => ({ ...v, lessonId: e.target.value }))}
                  >
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {tr(l)}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="form-grid">
                  {[
                    ['titleEn', 'English title'],
                    ['titleAr', 'العنوان العربي'],
                    ['captionEn', 'English caption'],
                    ['captionAr', 'الوصف العربي'],
                    ['altEn', 'English alternative text'],
                    ['altAr', 'النص البديل العربي'],
                  ].map(([key, label]) => (
                    <Field key={key} label={label}>
                      <textarea
                        rows={key.startsWith('caption') ? 4 : 2}
                        required
                        minLength={key.startsWith('caption') ? 15 : key.startsWith('alt') ? 5 : 3}
                        value={editor[key]}
                        dir={key.endsWith('Ar') ? 'rtl' : 'ltr'}
                        onChange={(e) => setEditor((v: any) => ({ ...v, [key]: e.target.value }))}
                      />
                    </Field>
                  ))}
                </div>
                <Field label={t('Image credit', 'حقوق الصورة')}>
                  <input
                    value={editor.credit}
                    minLength={3}
                    required
                    onChange={(e) => setEditor((v: any) => ({ ...v, credit: e.target.value }))}
                  />
                </Field>
                <Field label={t('Source URL', 'رابط المصدر')}>
                  <input
                    type="url"
                    required
                    value={editor.sourceUrl}
                    onChange={(e) => setEditor((v: any) => ({ ...v, sourceUrl: e.target.value }))}
                  />
                </Field>
                <Field label={t('Classification', 'التصنيف')}>
                  <select
                    value={editor.kind}
                    onChange={(e) => setEditor((v: any) => ({ ...v, kind: e.target.value }))}
                  >
                    <option value="OBSERVATION">
                      {t('Observation / processed observation', 'رصد / رصد معالج')}
                    </option>
                    <option value="ILLUSTRATION">
                      {t('Illustration / data visualization', 'رسم / تصور بيانات')}
                    </option>
                  </select>
                </Field>
              </>
            ) : (
              <>
                <Field label={t('Original reference title', 'عنوان المرجع الأصلي')}>
                  <input
                    required
                    minLength={3}
                    value={editor.title}
                    onChange={(e) => setEditor((v: any) => ({ ...v, title: e.target.value }))}
                  />
                </Field>
                <Field label={t('Publisher / rights holder', 'الناشر أو صاحب الحقوق')}>
                  <input
                    required
                    minLength={2}
                    value={editor.publisher}
                    onChange={(e) => setEditor((v: any) => ({ ...v, publisher: e.target.value }))}
                  />
                </Field>
                <Field label={t('Verified HTTPS source', 'مصدر HTTPS متحقق')}>
                  <input
                    type="url"
                    required
                    value={editor.url}
                    onChange={(e) => setEditor((v: any) => ({ ...v, url: e.target.value }))}
                  />
                </Field>
                <h3>{t('Associated lessons', 'الدروس المرتبطة')}</h3>
                <div className="reference-lesson-checkboxes">
                  {lessons.map((l) => (
                    <label className="checkbox-field" key={l.id}>
                      <input
                        type="checkbox"
                        checked={editor.lessonIds.includes(l.id)}
                        onChange={(e) =>
                          setEditor((v: any) => ({
                            ...v,
                            lessonIds: e.target.checked
                              ? [...v.lessonIds, l.id]
                              : v.lessonIds.filter((id: string) => id !== l.id),
                          }))
                        }
                      />
                      {tr(l)}
                    </label>
                  ))}
                </div>
              </>
            )}
            <Button type="submit" loading={busy}>
              {t('Save metadata for review', 'احفظ البيانات للمراجعة')}
            </Button>
          </form>
        </Modal>
      )}
    </section>
  );
}
