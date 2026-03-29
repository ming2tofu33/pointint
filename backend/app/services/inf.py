"""Windows .inf 커서 설치/원복 파일 생성."""


def generate_install_inf(cursor_filename: str = "cursor.cur") -> str:
    """커서 스킴을 Windows에 등록하는 .inf 파일 생성.

    우클릭 → "설치"로 동작.
    - 커서 파일을 %WINDIR%\\Cursors\\Pointint\\에 복사
    - "Pointint" 스킴을 레지스트리에 등록
    - 사용자가 마우스 설정 → 포인터 → 구성표에서 "Pointint" 선택하면 적용
    """
    # Windows 스킴은 15개 커서 경로를 쉼표로 구분
    # MVP: Normal(Arrow), Text(IBeam), Link(Hand)만 커스텀, 나머지는 빈 값(기본)
    cur_path = f"%10%\\Cursors\\Pointint\\{cursor_filename}"

    # 15개 순서: Arrow, Help, AppStarting, Wait, Cross, IBeam, NWPen,
    #           No, SizeNS, SizeWE, SizeNWSE, SizeNESW, SizeAll, UpArrow, Hand
    scheme_parts = [
        cur_path,  # Arrow (Normal)
        "",        # Help
        "",        # AppStarting
        "",        # Wait
        "",        # Cross
        cur_path,  # IBeam (Text)
        "",        # NWPen
        "",        # No
        "",        # SizeNS
        "",        # SizeWE
        "",        # SizeNWSE
        "",        # SizeNESW
        "",        # SizeAll
        "",        # UpArrow
        cur_path,  # Hand (Link)
    ]
    scheme_value = ",".join(scheme_parts)

    inf = f"""\
; Pointint Cursor
; Right-click this file and select "Install".
; Then go to Settings > Mouse > Additional mouse settings > Pointers
; and select "Pointint" from the Scheme dropdown.

[Version]
signature="$CHICAGO$"

[DefaultInstall]
CopyFiles = Scheme.Cur
AddReg    = Scheme.Reg

[DestinationDirs]
Scheme.Cur = 10,"Cursors\\Pointint"

[Scheme.Cur]
{cursor_filename}

[Scheme.Reg]
HKCU,"Control Panel\\Cursors\\Schemes","Pointint",,"{scheme_value}"

[Strings]
"""
    return inf.replace("\n", "\r\n")


def generate_restore_inf() -> str:
    """Pointint 커서 스킴을 레지스트리에서 제거하는 .inf 파일 생성.

    우클릭 → "설치"로 동작.
    스킴을 삭제하고 기본 커서로 돌아감.
    """
    inf = """\
; Pointint Cursor — Restore Default
; Right-click this file and select "Install".
; This removes the Pointint cursor scheme.
; Then go to Settings > Mouse > Additional mouse settings > Pointers
; and select "None" or "Windows Default" from the Scheme dropdown.

[Version]
signature="$CHICAGO$"

[DefaultInstall]
DelReg = Restore.Reg

[Restore.Reg]
HKCU,"Control Panel\\Cursors\\Schemes","Pointint"

[Strings]
"""
    return inf.replace("\n", "\r\n")
