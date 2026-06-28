# 小鈴 基礎動作三方向GIF マネキンプロンプト

## 用途

小鈴の基礎動作を、正面・左側面・右側面の3方向で連番化し、GIFで一貫した動きになっているか確認するための白い3Dデッサン人形プロンプト。

戻り動作は生成しない。
GIF化するときに `01 -> 02 -> 03 -> 02 -> 01` の順で並べる。

## 使用する参考画像

1. 承認済みの小鈴用体格マネキン四面図。
2. 承認済みの小鈴用基本構えマネキン。

参考画像は体格、頭身、関節位置、足幅、基本構えの正本として使用する。
小鈴の髪や衣装はまだ使用しない。

## 共通プロンプト

### 日本語

```text
添付した小鈴用の白い3D体格マネキンと基本構えマネキンを使用し、指定した基礎動作を正面、左側面、右側面の3方向で確認できる連番ポーズ資料として作成してください。

【目的】
小鈴の戦闘イラストを作る前に、白い3Dデッサン人形で動作の一貫性を確認するための資料です。
完成イラストではなく、支持脚、重心、関節、身体の回転、手足の軌道、顔と視線を検証するためのマネキン連番です。

【出力形式】
・指定した1つの基礎動作だけを作成する
・正面、左側面、右側面の3方向を作成する
・各方向につき3ステップを作成する
・合計9体の白い3Dデッサン人形を、一枚の3列×3行シートに配置する
・列は左から、正面、左側面、右側面
・行は上から、01構え、02動作途中、03到達
・各パネルにマネキン一体だけ
・全パネルで同じ体格、頭身、関節構造
・全パネルで同じアイレベル、床面、人物サイズ
・各パネル内に頭頂、両手、両足を完全に収める
・手足をパネル境界で切らない
・細い境界線でパネルを区切る
・画像内には小さな番号だけを入れてよい
・技名、説明文、方向名、ロゴ、透かしは入れない

【ステップ】
01構え:
・小鈴の基本武術構え
・左脚前、右脚後ろ
・両足接地
・顔と視線は技の方向
・動作開始前の静かな姿勢

02動作途中:
・構えから技へ移る途中
・支持脚、重心移動、骨盤、胸郭、肩、手足の軌道を見せる
・01と03の中間として自然につながる

03到達:
・攻撃、受け、移動、回転が成立する最大伸展または接触直前
・関節を伸ばし切らない
・支持脚と重心を成立させる
・顔と視線は技の到達方向

【戻り動作について】
・引き戻し動作は生成しない
・GIFでは 01 -> 02 -> 03 -> 02 -> 01 の順で確認する
・そのため、02は行きと戻りの両方に使える自然な中間姿勢にする

【マネキン】
・承認済みの小鈴用体格マネキンと同じ成人女性型
・21歳相当
・自然なアニメ調約7.3頭身
・しなやかで均整の取れた健康的な武術体型
・細すぎず、筋肉質すぎない
・白または明るい灰色のマット樹脂素材
・頭部、胸郭、骨盤に薄い中心線
・肩、肘、手首、股関節、膝、足首を明確にする
・手は五本指を簡潔に分ける
・両足は閉じた格闘靴型の簡略形状

【構図補助】
・薄い床面と接地影を入れ、足裏の位置と重心を確認できるようにする
・全パネルでアイレベル、床の高さ、カメラ距離、人物サイズを統一する
・前景の手足だけを巨大化させず、肩、肘、股関節、膝との接続を残す
・床面上の足位置、骨盤、胸郭、頭部の奥行き関係が読めるようにする

【重心と力線】
・支持脚を床へ完全に接地させる
・支持脚の膝を軽く緩める
・重心線が支持脚または両足の間へ落ちるようにする
・攻撃動作は、足、膝、骨盤、背骨、肩、肘、手先または足先まで一本の力線としてつなげる
・上体だけ、腕だけ、脚だけの動作にしない

【顔と視線】
・顔と視線はカメラではなく、技の到達方向を見る
・鼻先、顎、両目を技の方向へそろえる
・側面でも首だけをカメラへ向けない
・回転動作では、顔と視線を身体の回転より少し先行させる

【禁止事項】
髪、衣装、前垂れ、レギンス、靴、装飾、武器、敵、
完成イラスト風の顔や配色、背景、エフェクト、
同じポーズの繰り返し、3方向の混同、左右の入れ替え、
戻り動作の追加、4ステップ以上の連番、別の動作との混合、
余分な腕や脚、六本指、欠けた指、融合した指、
折れた手首、逆関節、反転した足首、浮いた支持脚、
膝と足先の不一致、身体から切断して見える手足、
技名、説明文、方向名、ロゴ、透かし
```

### English

```text
Using the attached white 3D build mannequin and basic-stance mannequin for Xiaoling, create a numbered pose reference that lets you check the specified basic motion from three directions: front, left side, and right side.

[Purpose]
This is a reference for checking the consistency of a motion with a white 3D drawing mannequin before making Xiaoling's battle illustrations.
It is not a finished illustration, but a numbered mannequin series for verifying the supporting leg, center of gravity, joints, body rotation, limb trajectory, and face/gaze.

[Output format]
- Create only one specified basic motion
- Create three directions: front, left side, right side
- Create 3 steps per direction
- Arrange a total of 9 white 3D drawing mannequins in a single 3-column x 3-row sheet
- Columns from left: front, left side, right side
- Rows from top: 01 stance, 02 mid-motion, 03 reach
- Only one mannequin per panel
- Same build, head ratio, and joint structure across all panels
- Same eye level, floor plane, and figure size across all panels
- Fully fit the top of the head and both hands and feet within each panel
- Do not cut limbs at the panel borders
- Divide the panels with thin borders
- Only small numbers may be placed inside the image
- Do not add technique names, descriptions, direction names, logo, or watermark

[Steps]
01 Stance:
- Xiaoling's basic martial-arts stance
- Left leg forward, right leg back
- Both feet planted
- Face and gaze toward the technique direction
- A quiet posture before the motion starts

02 Mid-motion:
- Mid-way from the stance into the technique
- Show the supporting leg, weight shift, pelvis, rib cage, shoulders, and limb trajectory
- Connects naturally as the midpoint between 01 and 03

03 Reach:
- Maximum extension or just before contact where the attack, block, movement, or rotation is established
- Do not fully lock out the joints
- Establish the supporting leg and center of gravity
- Face and gaze toward where the technique reaches

[About the return motion]
- Do not generate the pull-back motion
- In the GIF, check in the order 01 -> 02 -> 03 -> 02 -> 01
- Therefore, make 02 a natural midpoint usable for both the outgoing and returning motion

[Mannequin]
- The same adult female type as the approved Xiaoling build mannequin
- Equivalent to 21 years old
- About 7.3 heads tall in a natural anime style
- A supple, well-proportioned, healthy martial-arts physique
- Not too thin, not too muscular
- White or light gray matte resin material
- Faint center lines on head, rib cage, and pelvis
- Clearly mark shoulders, elbows, wrists, hips, knees, and ankles
- Hands simply separated into five fingers
- Both feet as simplified closed fighting-shoe shapes

[Composition support]
- Add a faint floor plane and contact shadow so the sole positions and center of gravity can be checked
- Unify eye level, floor height, camera distance, and figure size across all panels
- Do not enlarge only the foreground hands/feet; keep the connection to shoulders, elbows, hips, and knees
- Make the depth relationship of foot position, pelvis, rib cage, and head readable

[Center of gravity and force lines]
- Plant the supporting leg fully on the floor
- Keep the supporting leg's knee slightly relaxed
- Let the line of gravity fall onto the supporting leg or between both feet
- Connect attacking motions as a single force line from foot, knee, pelvis, spine, shoulder, elbow, and out to the hand or foot tip
- Do not make it a motion of only the upper body, only the arms, or only the legs

[Face and gaze]
- The face and gaze look toward where the technique reaches, not the camera
- Align the nose tip, chin, and both eyes with the technique's direction
- Even from the side, do not turn only the neck toward the camera
- In rotational motions, lead the face and gaze slightly ahead of the body's rotation

[Prohibited]
Hair, outfit, front cloth, leggings, shoes, ornaments, weapons, enemies,
finished-illustration-style face or colors, background, effects,
repeating the same pose, confusing the 3 directions, swapping left/right,
adding a return motion, a series of 4 or more steps, mixing with another motion,
extra arms or legs, six fingers, missing fingers, fused fingers,
broken wrists, reversed joints, flipped ankles, floating supporting leg,
mismatched knee and foot tip, limbs that look severed from the body,
technique names, descriptions, direction names, logo, watermark
```

## 01 前手直突き

### 日本語

```text
上記の共通条件で、01 前手直突きを作成してください。

【動作】
左脚を前、右脚を後ろにした構えから、左前手の拳を相手の中心へまっすぐ突き出す。

【参考画像の使い方】
・連続動作参考画像を使う場合は、左上の1→2→3の直突き連続部分だけを参考にする
・01は構え、02は左拳が伸び始める途中、03は左拳が相手の中心へ届く直前として扱う
・中央の大きく誇張された直突きポーズは、動きの勢いだけを参考にし、上体前傾や踏み込みを強くしすぎない
・単発ポーズ画像は、前手と後手の役割、拳・肘・肩の接続だけを低優先の補助として参考にする
・足幅、支持脚、重心、左右の脚位置は小鈴の基本武術構えマネキンを正本にする

01構え:
・左脚前、右脚後ろ
・左拳は前方、顎から胸の高さ
・右拳は顔または胸の近くで守る

02動作途中:
・左拳が前方へ伸び始める
・左肩が少し前へ出る
・後ろ足と骨盤から力が伝わる
・右拳は守りに残る

03到達:
・左拳が相手の中心へ届く直前
・左肘は完全に伸ばし切らない
・肩、肘、手首、拳を自然につなげる
・拳で顔を完全に隠さない
```

### English

```text
Under the common conditions above, create 01 lead-hand straight punch.

[Motion]
From a stance with the left leg forward and right leg back, thrust the left lead-hand fist straight toward the opponent's center.

[How to use the reference image]
- If using the motion-sequence reference image, use only the 1 -> 2 -> 3 straight-punch sequence in the upper-left area
- Treat 01 as the stance, 02 as the moment when the left fist begins to extend, and 03 as just before the left fist reaches the opponent's center
- Use the large exaggerated straight-punch pose in the center only for the sense of momentum; do not overdo the forward lean or step-in
- Use single-pose images only as low-priority support for the roles of the lead hand and guard hand, and for the fist-elbow-shoulder connection
- Use Xiaoling's basic martial-arts stance mannequin as the master for foot width, supporting leg, center of gravity, and left/right leg positions

01 Stance:
- Left leg forward, right leg back
- Left fist forward, at chin-to-chest height
- Right fist guarding near the face or chest

02 Mid-motion:
- The left fist begins to extend forward
- The left shoulder comes slightly forward
- Force transmits from the rear foot and pelvis
- The right fist stays in guard

03 Reach:
- Just before the left fist reaches the opponent's center
- Do not fully lock out the left elbow
- Connect shoulder, elbow, wrist, and fist naturally
- Do not fully hide the face with the fist
```

## 02 後手直突き

### 日本語

```text
上記の共通条件で、02 後手直突きを作成してください。

【動作】
左脚前、右脚後ろの構えから、右後手の拳を前方へ突き出す。

01構え:
・左脚前、右脚後ろ
・左手は前、右拳は頬から胸の近く

02動作途中:
・右後足で床を押す
・右膝、骨盤、背骨、右肩が前方へ連動する
・左拳は顔の近くで守る

03到達:
・右拳が相手の中心へ届く直前
・右後足、右膝、骨盤、背骨、右肩、右肘、右拳を一本の力線へつなげる
・右肘を伸ばし切らない
・左拳は守りに残す
```

### English

```text
Under the common conditions above, create 02 rear-hand straight punch.

[Motion]
From a stance with the left leg forward and right leg back, thrust the right rear-hand fist forward.

01 Stance:
- Left leg forward, right leg back
- Left hand forward, right fist near the cheek to chest

02 Mid-motion:
- Push the floor with the right rear foot
- The right knee, pelvis, spine, and right shoulder link forward
- The left fist guards near the face

03 Reach:
- Just before the right fist reaches the opponent's center
- Connect the right rear foot, right knee, pelvis, spine, right shoulder, right elbow, and right fist into a single force line
- Do not fully lock out the right elbow
- Keep the left fist in guard
```

## 03 穿掌

### 日本語

```text
上記の共通条件で、03 穿掌を作成してください。

【動作】
開いた掌を前方へ差し込むように突き出す。

01構え:
・左脚前、右脚後ろ
・前の手は軽く開く
・後ろの手は胸の近くで守る

02動作途中:
・掌が相手の中心線へ差し込まれる
・指先、手首、肘、肩が一つの線へ近づく
・骨盤と胸郭が技の方向へつながる

03到達:
・掌が前方へ伸びる
・指先から掌全体へ穿つ動き
・手首を反らしすぎない
・四本指と親指一本を明確に分ける
```

### English

```text
Under the common conditions above, create 03 piercing palm.

[Motion]
Thrust an open palm forward as if inserting it.

01 Stance:
- Left leg forward, right leg back
- The front hand lightly open
- The rear hand guarding near the chest

02 Mid-motion:
- The palm is inserted toward the opponent's center line
- Fingertips, wrist, elbow, and shoulder approach a single line
- The pelvis and rib cage link toward the technique's direction

03 Reach:
- The palm extends forward
- A piercing motion from the fingertips through the whole palm
- Do not over-bend the wrist
- Clearly separate the four fingers and one thumb
```

## 04 前蹴り

### 日本語

```text
上記の共通条件で、04 前蹴りを作成してください。

【動作】
支持脚で立ち、膝を引き上げてから、踵または足裏で前方を押す。

01構え:
・左脚前、右脚後ろ
・両手で中心線を守る

02動作途中:
・蹴り脚の膝を先に引き上げる
・支持脚を床へ完全に接地する
・骨盤を前へ送りすぎない
・両手は顔または胸の近くへ残す

03到達:
・踵または足裏で前方を押す
・蹴り脚の股関節、膝、足首、踵を同じ進行面へ置く
・上体は蹴り方向と反対へわずかに傾けるが、反りすぎない
・横蹴りや回し蹴りにしない
```

### English

```text
Under the common conditions above, create 04 front kick.

[Motion]
Stand on the supporting leg, raise the knee, then push forward with the heel or sole.

01 Stance:
- Left leg forward, right leg back
- Guard the center line with both hands

02 Mid-motion:
- Raise the knee of the kicking leg first
- Plant the supporting leg fully on the floor
- Do not push the pelvis too far forward
- Keep both hands near the face or chest

03 Reach:
- Push forward with the heel or sole
- Place the hip, knee, ankle, and heel of the kicking leg on the same plane of travel
- Tilt the upper body slightly opposite to the kick direction, but do not over-arch
- Do not make it a side kick or roundhouse kick
```

## 05 横蹴り

### 日本語

```text
上記の共通条件で、05 横蹴りを作成してください。

【動作】
軸足で立ち、股関節を開いて、踵または足刀を横方向へ伸ばす。

01構え:
・左脚前、右脚後ろ
・両手で中心線を守る

02動作途中:
・膝を横方向へ引き上げる
・軸足を床へ完全に接地する
・骨盤を横へ開く

03到達:
・踵または足刀を横方向へ出す
・蹴り脚の股関節、膝、足首、足先を同じ面へ置く
・上体を蹴り脚と反対側へ自然に倒し、重心を軸足上へ残す
・完全な水平開脚や舞踊的な姿勢にしない
```

### English

```text
Under the common conditions above, create 05 side kick.

[Motion]
Stand on the pivot foot, open the hip, and extend the heel or foot-blade sideways.

01 Stance:
- Left leg forward, right leg back
- Guard the center line with both hands

02 Mid-motion:
- Raise the knee sideways
- Plant the pivot foot fully on the floor
- Open the pelvis to the side

03 Reach:
- Send the heel or foot-blade out sideways
- Place the hip, knee, ankle, and foot tip of the kicking leg on the same plane
- Lean the upper body naturally to the opposite side of the kicking leg, keeping the center of gravity over the pivot foot
- Do not make it a full horizontal split or dance-like posture
```

## 06 円掌受け

### 日本語

```text
上記の共通条件で、06 円掌受けを作成してください。

【動作】
掌で円を描くように相手の力を受け流す。

01構え:
・左脚前、右脚後ろ
・前の手は胸から肩の高さ
・後ろの手は身体の中心を守る

02動作途中:
・掌が外から内、または内から外へ円を描く
・肩甲骨、胸郭、骨盤が受け流し方向へ少し回る
・反対の手は守りに残す

03到達:
・掌で力を斜め外または斜め下へ逃がす
・手首を折りすぎない
・掌の向きと親指の位置を一致させる
・顔と視線は受け流す方向へ向ける
```

### English

```text
Under the common conditions above, create 06 circular palm parry.

[Motion]
Parry the opponent's force with the palm drawing a circle.

01 Stance:
- Left leg forward, right leg back
- The front hand at chest-to-shoulder height
- The rear hand guarding the body's center

02 Mid-motion:
- The palm draws a circle from outside to inside, or inside to outside
- The shoulder blades, rib cage, and pelvis rotate slightly toward the parry direction
- The other hand stays in guard

03 Reach:
- The palm guides the force diagonally outward or downward
- Do not over-bend the wrist
- Match palm orientation with thumb position
- Face and gaze toward the parry direction
```

## 07 退歩

### 日本語

```text
上記の共通条件で、07 退歩を作成してください。

【動作】
相手の力を引き込みながら、一歩後退して重心を移す。
これは攻撃の引き戻しではなく、独立した後退歩法です。

01構え:
・左脚前、右脚後ろ
・両手は中心線を守る

02動作途中:
・後脚へ重心を移し始める
・前脚を軽く引く
・両手は相手の力を斜め後ろまたは下へ導く

03到達:
・重心が後脚へ移る
・前脚は軽く接地または次の動作へ移れる位置
・背骨を保ち、腰だけを引かない
・前進攻撃に見せない
```

### English

```text
Under the common conditions above, create 07 retreating step.

[Motion]
While pulling in the opponent's force, step back one step and shift the center of gravity.
This is not the pull-back of an attack, but an independent retreating footwork.

01 Stance:
- Left leg forward, right leg back
- Both hands guard the center line

02 Mid-motion:
- Begin shifting the center of gravity onto the rear leg
- Lightly draw back the front leg
- Both hands guide the opponent's force diagonally back or down

03 Reach:
- The center of gravity moves onto the rear leg
- The front leg lightly planted or positioned to move into the next motion
- Keep the spine; do not pull back only the hips
- Do not make it look like a forward attack
```

## 08 旋身換歩

### 日本語

```text
上記の共通条件で、08 旋身換歩を作成してください。

【動作】
軸足を使って身体を回転させ、足位置を入れ替える途中の動作。

01構え:
・左脚前、右脚後ろ
・両手は中心線を守る

02動作途中:
・軸足を床へ接地したまま身体を回転させる
・骨盤、胸郭、肩が同じ回転方向へつながる
・顔と視線は回転方向へ少し先行する

03到達:
・足位置が入れ替わり、次の攻撃または受けへ移れる
・片手は守り、片手は次の動作へ移る位置
・重心が浮かない
・跳躍や舞踊ポーズにしない
```

### English

```text
Under the common conditions above, create 08 turning body, changing step.

[Motion]
A motion mid-way through rotating the body with the pivot foot and swapping foot positions.

01 Stance:
- Left leg forward, right leg back
- Both hands guard the center line

02 Mid-motion:
- Rotate the body while keeping the pivot foot planted on the floor
- The pelvis, rib cage, and shoulders link in the same direction of rotation
- The face and gaze lead slightly ahead of the rotation direction

03 Reach:
- The foot positions are swapped, ready to move into the next attack or block
- One hand guards; one hand is positioned for the next motion
- The center of gravity does not float
- Do not make it a jump or dance pose
```

## GIF作成時のフレーム順

各方向ごとに、以下の順でGIF化する。

```text
01構え -> 02途中 -> 03到達 -> 02途中 -> 01構え
```

例:

```powershell
python "C:\モデルイラスト生成ワークフロー\04_gif_tools\make_preview_gif.py" `
  --frames `
  "正面_01構え.png" `
  "正面_02途中.png" `
  "正面_03到達.png" `
  "正面_02途中.png" `
  "正面_01構え.png" `
  --out "小鈴_01前手直突き_正面_確認.gif" `
  --duration 180
```
