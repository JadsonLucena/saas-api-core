import eslintJS from '@eslint/js'
import eslintTS from 'typescript-eslint'
import pluginSecurity from 'eslint-plugin-security'

export default eslintTS.config(
	eslintJS.configs.recommended,
	eslintTS.configs.recommended,
	pluginSecurity.configs.recommended,
	{
		ignores: [
			'eslint.config.ts',
			'coverage/*',
			'dist/*',
			'lib/*'
		]
	}
)