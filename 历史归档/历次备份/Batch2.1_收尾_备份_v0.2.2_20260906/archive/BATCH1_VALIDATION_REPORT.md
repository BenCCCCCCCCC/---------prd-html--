# Batch 1 静态规格检查

实际执行：22组检查；通过22组。

仅校验规格文件与人工编写的预期数据，不是应用/模型执行报告。

| 检查 | 结果 |
|---|---|
| schema_meta_candidate | 通过 |
| schema_meta_request | 通过 |
| ai_case_count_unique | 通过 |
| input_spec_accept_reject_matches | 通过 |
| expected_candidates_schema_valid | 通过 |
| invalid_output_schema_expectations | 通过 |
| schema_valid_domain_conflict_fixture | 通过 |
| catalog_records | 通过 |
| catalog_synthetic_no_audio | 通过 |
| catalog_language_consistency | 通过 |
| blacklist_entities_exist | 通过 |
| ranking_fixture_recalculation | 通过 |
| acceptance_case_count_and_refs | 通过 |
| runtime_status_not_misrepresented | 通过 |
| event_names_unique | 通过 |
| no_raw_input_event_field | 通过 |
| protected_scope_configs | 通过 |
| real_api_disabled | 通过 |
| design_token_contrast | 通过 |
| project_skill_frontmatter | 通过 |
| diagram_assets_present | 通过 |
| render_count_and_page_bounds | 通过 |

两个Word文档分别18页、10页。页面边界检查与逐页图像审查分别记录，不用机器边界通过替代视觉审查。

未执行：解析器/模型40例的实际运行、30条功能验收、真实用户测试、跨浏览器HTML和Figma全部跳转、公开发布。
