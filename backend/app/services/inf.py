"""Windows .inf 커서 설치/원복 파일 생성."""


def generate_install_inf(cursor_filename: str = "cursor.cur") -> str:
    """커서를 Windows에 등록하는 .inf 파일 생성.

    우클릭 → "설치"로 동작.
    MVP 3종: Arrow(Normal), IBeam(Text), Hand(Link)
    """
    inf = f"""\
[Version]
signature="$CHICAGO$"

[DefaultInstall]
CopyFiles = Cursor.Files
AddReg = Cursor.Reg

[DestinationDirs]
Cursor.Files = 10,Cursors\\Pointint

[Cursor.Files]
{cursor_filename}

[Cursor.Reg]
HKCU,"Control Panel\\Cursors",Arrow,,"%10%\\Cursors\\Pointint\\{cursor_filename}"
HKCU,"Control Panel\\Cursors",IBeam,,"%10%\\Cursors\\Pointint\\{cursor_filename}"
HKCU,"Control Panel\\Cursors",Hand,,"%10%\\Cursors\\Pointint\\{cursor_filename}"
HKCU,"Control Panel\\Cursors",,,"Pointint"

[Strings]
"""
    # Windows .inf는 CRLF 필수
    return inf.replace("\n", "\r\n")


def generate_restore_inf() -> str:
    """Windows 기본 커서로 원복하는 .inf 파일 생성.

    우클릭 → "설치"로 동작.
    레지스트리 값을 빈 문자열로 리셋 → Windows 기본 커서 복원.
    """
    inf = """\
[Version]
signature="$CHICAGO$"

[DefaultInstall]
AddReg = Restore.Reg

[Restore.Reg]
HKCU,"Control Panel\\Cursors",Arrow,,""
HKCU,"Control Panel\\Cursors",IBeam,,""
HKCU,"Control Panel\\Cursors",Hand,,""
HKCU,"Control Panel\\Cursors",,,"Windows Default"

[Strings]
"""
    return inf.replace("\n", "\r\n")
